import React, { useState, useEffect } from 'react';
import { Users, ChevronDown, ChevronRight, Calendar, FileText, Clock } from 'lucide-react';

// Fictitious family data
const PEOPLE = {
  john: { id: 'john', name: 'John Smith', birth: 1940, death: 2020 },
  mary: { id: 'mary', name: 'Mary Johnson', birth: 1942, death: 2005 },
  susan: { id: 'susan', name: 'Susan Davis', birth: 1955, death: null },
  alice: { id: 'alice', name: 'Alice Smith', birth: 1968, death: null },
  bob: { id: 'bob', name: 'Bob Smith', birth: 1970, death: 2018 },
  charlie: { id: 'charlie', name: 'Charlie Smith', birth: 1985, death: null },
  david: { id: 'david', name: 'David Smith', birth: 1995, death: null },
  emma: { id: 'emma', name: 'Emma Smith', birth: 1998, death: null },
  frank: { id: 'frank', name: 'Frank Smith', birth: 2000, death: 2021 },
};

// Timeline events (with pre-calculated ownership from Calculator)
// Note: Bob's death (2018) is a family event but NOT a transfer event since Bob had no ownership
const EVENTS = [
  {
    id: 'deed_2015',
    date: new Date('2015-06-01'),
    type: 'DEED',
    label: 'Deed to Alice',
    source: 'john',
    preamble: "John transfers 1/4 of his ownership (the entire property) to Alice.",
    recipients: [{ id: 'alice', fraction: '1/4' }],
    warnings: [],
    deedDocument: {
      title: 'Warranty Deed',
      recordDate: 'June 1, 2015',
      grantor: 'John Smith',
      grantee: 'Alice Smith',
      property: 'Property at 123 Oak Street, Richmond, Virginia',
      consideration: 'Love and affection',
      description: 'An undivided one-quarter (1/4) interest in the property known as 123 Oak Street'
    }
  },
  {
    id: 'death_john_2020',
    date: new Date('2020-09-20'),
    type: 'DEATH',
    label: 'John dies',
    source: 'john',
    legalBasis: {
      statute: 'N.C. Gen. Stat. § 29-15',
      title: 'Intestate Succession - Surviving Spouse and Descendants',
      url: 'https://www.ncleg.gov/EnactedLegislation/Statutes/HTML/BySection/Chapter_29/GS_29-15.html'
    },
    preamble: "John had a surviving spouse and three children for whom ownership is transferred to directly or to their alive progeny.",
    recipients: [
      { 
        id: 'susan', 
        fraction: '3/8', 
        via: 'SPOUSE', 
        fractionOfSource: '1/2',
        explanation: "As the surviving spouse, Susan receives 1/2 of John's property (3/4 of the total), yielding 1/2 × 3/4 = 3/8"
      },
      { 
        id: 'alice', 
        fraction: '1/8', 
        via: 'PROGENY', 
        fractionOfSource: '1/6',
        explanation: "As a child, Alice receives 1/2 of John's property (3/4 of the total) divided by the number of John's offspring (3), yielding 1/2 × 3/4 × 1/3 = 1/8"
      },
      { 
        id: 'bob', 
        fraction: '1/8', 
        via: 'PROGENY',
        fractionOfSource: '1/6',
        deceased: true,
        explanation: "As a child, Bob would receive 1/2 of John's property (3/4 of the total) divided by the number of John's offspring (3), yielding 1/2 × 3/4 × 1/3 = 1/8",
        passthrough: [
          { 
            id: 'david', 
            fraction: '1/16', 
            via: 'PROGENY', 
            fractionOfBob: '1/3',
            explanation: "As Bob's child (per stirpes), David receives 1/3 of Bob's share (1/8), yielding 1/3 × 1/8 = 1/16"
          },
          { 
            id: 'emma', 
            fraction: '1/16', 
            via: 'PROGENY', 
            fractionOfBob: '1/3',
            explanation: "As Bob's child (per stirpes), Emma receives 1/3 of Bob's share (1/8), yielding 1/3 × 1/8 = 1/16"
          },
          { 
            id: 'frank', 
            fraction: '1/16', 
            via: 'PROGENY', 
            fractionOfBob: '1/3',
            explanation: "As Bob's child (per stirpes), Frank receives 1/3 of Bob's share (1/8), yielding 1/3 × 1/8 = 1/16"
          }
        ]
      },
      { 
        id: 'charlie', 
        fraction: '1/8', 
        via: 'PROGENY', 
        fractionOfSource: '1/6',
        explanation: "As a child, Charlie receives 1/2 of John's property (3/4 of the total) divided by the number of John's offspring (3), yielding 1/2 × 3/4 × 1/3 = 1/8"
      }
    ],
    warnings: []
  },
  {
    id: 'death_frank_2021',
    date: new Date('2021-05-15'),
    type: 'DEATH',
    label: 'Frank dies',
    source: 'frank',
    legalBasis: {
      statute: 'N.C. Gen. Stat. § 29-16',
      title: 'Intestate Succession - No Spouse, Parents, or Descendants',
      url: 'https://www.ncleg.gov/EnactedLegislation/Statutes/HTML/BySection/Chapter_29/GS_29-16.html'
    },
    recipients: [
      { 
        id: 'david', 
        fraction: '1/32',
        via: 'PROGENY',
        explanation: "David splits all of Frank's ownership (1/16 of the whole) with his (1) sibling, yielding 1/16 × 1/2 = 1/32"
      },
      { 
        id: 'emma', 
        fraction: '1/32',
        via: 'PROGENY',
        explanation: "Emma splits all of Frank's ownership (1/16 of the whole) with her (1) sibling, yielding 1/16 × 1/2 = 1/32"
      }
    ],
    preamble: "There is no (known) alive parent, surviving spouse, or children, so Frank's ownership is split amongst his siblings.",
    warnings: [
      { 
        type: 'UNKNOWN_CHILDREN', 
        personId: 'frank',
        message: 'Unknown if Frank had children at time of death'
      },
      { 
        type: 'UNKNOWN_SPOUSE', 
        personId: 'frank',
        message: 'Unknown if Frank had a surviving spouse at time of death'
      },
      { 
        type: 'UNKNOWN_PARENT', 
        personId: 'frank',
        message: 'Unknown if Frank had a living parent at death (Bob\'s co-parent)'
      }
    ]
  }
];

// Ownership states at different dates (pre-calculated by Calculator)
// Note: Bob never had ownership, so he doesn't appear in ownership states
const OWNERSHIP_STATES = {
  '2010-01-01': { john: '1' },
  '2015-06-02': { john: '3/4', alice: '1/4' },
  '2020-09-21': { 
    susan: '3/8', 
    alice: '3/8', 
    david: '1/16', 
    emma: '1/16', 
    charlie: '1/8',
    frank: '1/16'
  },
  '2021-05-16': {
    susan: '3/8',
    alice: '3/8',
    david: '3/32',
    emma: '3/32',
    charlie: '1/8',
    frank: '0'
  }
};

// Tree structure (parent-child relationships)
const TREE_STRUCTURE = {
  john: {
    marriages: [
      { spouse: 'mary', start: 1965, end: 2005, endReason: 'DEATH' },
      { spouse: 'susan', start: 2007, end: null }
    ],
    children: ['alice', 'bob', 'charlie']
  },
  bob: {
    marriages: [], // Bob's marital status unknown
    children: ['david', 'emma', 'frank']
  }
};

function DeedDocument({ deed, onClose }) {
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div className="bg-white rounded-lg shadow-2xl max-w-2xl w-full max-h-[80vh] overflow-auto" onClick={e => e.stopPropagation()}>
        <div className="sticky top-0 bg-white border-b p-4 flex justify-between items-center">
          <h3 className="text-2xl font-bold text-gray-800">{deed.title}</h3>
          <button 
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 text-2xl leading-none"
          >
            ×
          </button>
        </div>
        
        <div className="p-8 font-serif">
          <div className="text-center mb-8">
            <div className="text-sm text-gray-600 mb-2">Commonwealth of Virginia</div>
            <div className="text-sm text-gray-600 mb-4">County of Richmond</div>
            <div className="text-xl font-bold mt-4">{deed.title}</div>
          </div>
          
          <div className="space-y-4 text-gray-800">
            <p className="text-sm leading-relaxed">
              <span className="font-semibold">THIS DEED</span>, made this {deed.recordDate}, by and between:
            </p>
            
            <div className="ml-8">
              <p className="mb-2">
                <span className="font-semibold">GRANTOR:</span> {deed.grantor}, an individual residing in the Commonwealth of Virginia
              </p>
              <p>
                <span className="font-semibold">GRANTEE:</span> {deed.grantee}, an individual residing in the Commonwealth of Virginia
              </p>
            </div>
            
            <p className="text-sm leading-relaxed">
              <span className="font-semibold">WITNESSETH:</span> That for and in consideration of {deed.consideration}, and other good and valuable consideration, the receipt and sufficiency of which is hereby acknowledged, the Grantor does hereby grant, bargain, sell, and convey unto the Grantee, {deed.grantee}, the following described real property:
            </p>
            
            <div className="bg-gray-50 p-4 rounded border-l-4 border-blue-600 my-4">
              <p className="font-semibold mb-2">PROPERTY DESCRIPTION:</p>
              <p className="text-sm">{deed.description}</p>
              <p className="text-sm mt-2 text-gray-600">
                Being the same property conveyed to Grantor by deed dated January 15, 1975, recorded in Deed Book 456, Page 789, in the Clerk's Office of the Circuit Court of Richmond County, Virginia.
              </p>
            </div>
            
            <p className="text-sm leading-relaxed">
              <span className="font-semibold">TO HAVE AND TO HOLD</span> the said property, together with all rights, privileges, and appurtenances thereunto belonging, unto the Grantee, and Grantee's heirs and assigns forever.
            </p>
            
            <p className="text-sm leading-relaxed">
              The Grantor covenants with the Grantee that the Grantor is seized of said property in fee simple, has the right to convey the same in fee simple, that the property is free and clear of all encumbrances, and that Grantor will warrant and defend the title to same against the lawful claims of all persons whomsoever.
            </p>
            
            <div className="mt-12 pt-8 border-t">
              <div className="flex justify-between items-end">
                <div>
                  <div className="mb-2 text-sm text-gray-600">WITNESS the following signature:</div>
                  <div className="border-b-2 border-gray-400 w-64 mb-1"></div>
                  <div className="text-sm">{deed.grantor}, Grantor</div>
                </div>
              </div>
              
              <div className="mt-8 p-4 bg-blue-50 rounded text-xs text-gray-600">
                <div className="font-semibold mb-2">CLERK'S CERTIFICATE</div>
                <p>Recorded on {deed.recordDate} at 2:30 PM in Deed Book 892, Page 234, in the Office of the Clerk of the Circuit Court of Richmond County, Virginia.</p>
                <div className="mt-2 text-right">
                  <div>Sarah Johnson, Clerk</div>
                  <div>Richmond County Circuit Court</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function Fraction({ value }) {
  return (
    <span className="font-mono text-sm font-medium">
      {value}
    </span>
  );
}

function PersonNode({ person, ownership, status, onExpand, isCollapsed, showDetails, warnings }) {
  const colors = {
    owner: 'bg-gradient-to-br from-emerald-500 to-teal-600 text-white',
    former: 'bg-gradient-to-br from-slate-400 to-slate-500 text-white',
    future: 'bg-gradient-to-br from-blue-400 to-indigo-500 text-white opacity-60',
    nonOwner: 'bg-gradient-to-br from-gray-200 to-gray-300 text-gray-700'
  };

  const deceased = person.death !== null;

  return (
    <div className={`rounded-lg shadow-lg p-4 min-w-[200px] max-w-[250px] transition-all duration-300 hover:shadow-xl ${colors[status]} relative`}>
      {warnings && warnings.length > 0 && (
        <div className="absolute -top-2 -right-2 bg-yellow-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold shadow-lg group">
          ⚠
          <div className="absolute top-full right-0 mt-2 bg-gray-900 text-white text-xs rounded-lg p-3 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap shadow-xl z-10 w-64">
            {warnings.map((w, i) => (
              <div key={i} className="mb-1 last:mb-0">{w.message}</div>
            ))}
            <div className="absolute bottom-full right-2 border-4 border-transparent border-b-gray-900" />
          </div>
        </div>
      )}
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="font-bold text-lg">{person.name}</div>
          <div className="text-xs opacity-80 mt-1">
            {person.birth}–{person.death || 'present'}
            {deceased && ' †'}
          </div>
          {ownership && ownership !== '0' && (
            <div className="mt-2 pt-2 border-t border-white/30">
              <div className="text-xs opacity-80">Ownership:</div>
              <Fraction value={ownership} />
            </div>
          )}
        </div>
        {onExpand && (
          <button
            onClick={onExpand}
            className="ml-2 p-1 hover:bg-white/20 rounded transition-colors"
          >
            {isCollapsed ? <ChevronRight size={20} /> : <ChevronDown size={20} />}
          </button>
        )}
      </div>
    </div>
  );
}

function TransferNodeVisual({ type, label }) {
  const icons = {
    PROGENY: <Users size={18} />,
    SPOUSE: <span className="text-lg">💑</span>,
    DEED: <FileText size={18} />,
    WILL: <FileText size={18} />
  };

  const colors = {
    PROGENY: 'bg-purple-500 text-white border-purple-600',
    SPOUSE: 'bg-pink-500 text-white border-pink-600',
    DEED: 'bg-orange-500 text-white border-orange-600',
    WILL: 'bg-blue-500 text-white border-blue-600'
  };

  return (
    <div className={`rounded-full w-10 h-10 border-2 ${colors[type]} flex items-center justify-center shadow-md group relative cursor-help`}>
      {icons[type]}
      <div className="absolute bottom-full mb-2 bg-gray-900 text-white text-xs rounded-lg px-3 py-2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap shadow-xl z-10">
        {label}
        <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-gray-900" />
      </div>
    </div>
  );
}

function Timeline({ events, currentDate, onDateChange, onEventClick }) {
  const sortedEvents = [...events].sort((a, b) => a.date - b.date);
  const minDate = new Date('2010-01-01');
  const maxDate = new Date('2025-01-01');
  const timeRange = maxDate - minDate;

  return (
    <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
      <div className="flex items-center gap-2 mb-4">
        <Clock className="text-indigo-600" size={24} />
        <h3 className="text-xl font-bold text-gray-800">Timeline</h3>
      </div>
      
      <div className="relative h-20 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-lg p-4">
        {/* Timeline line */}
        <div className="absolute top-1/2 left-4 right-4 h-1 bg-indigo-200 rounded-full" />
        
        {/* Event markers */}
        {sortedEvents.map(event => {
          const position = ((event.date - minDate) / timeRange) * 100;
          const eventTypes = {
            DEATH: { icon: '💀', color: 'bg-red-500' },
            DEED: { icon: '📄', color: 'bg-orange-500' },
            WILL: { icon: '📜', color: 'bg-blue-500' }
          };
          const typeInfo = eventTypes[event.type];
          
          return (
            <div
              key={event.id}
              className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 group cursor-pointer"
              style={{ left: `${position}%` }}
              onClick={() => onEventClick(event)}
            >
              <div className={`w-8 h-8 ${typeInfo.color} rounded-full flex items-center justify-center text-white shadow-lg hover:scale-110 transition-transform`}>
                <span className="text-sm">{typeInfo.icon}</span>
              </div>
              
              {/* Hover popup */}
              <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 bg-gray-900 text-white text-xs rounded-lg p-3 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap shadow-xl z-10">
                <div className="font-bold mb-1">{event.label}</div>
                <div className="text-gray-300">{event.date.toLocaleDateString()}</div>
                <div className="mt-2 text-gray-400">
                  {PEOPLE[event.source].name} →
                </div>
                {event.recipients.map(r => (
                  <div key={r.id} className="text-gray-300">
                    • {PEOPLE[r.id].name} ({r.fraction})
                  </div>
                ))}
                <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-gray-900" />
              </div>
            </div>
          );
        })}
      </div>
      
      <div className="mt-4 flex justify-between text-xs text-gray-500">
        <span>2010</span>
        <span>2015</span>
        <span>2020</span>
        <span>2025</span>
      </div>
    </div>
  );
}

function TreeView({ date, collapsed, onToggleCollapse }) {
  const dateKey = date.toISOString().split('T')[0];
  const ownership = OWNERSHIP_STATES[dateKey] || OWNERSHIP_STATES['2021-05-16'];
  
  const getStatus = (personId) => {
    const ownValue = ownership[personId];
    if (ownValue && ownValue !== '0') return 'owner';
    const person = PEOPLE[personId];
    if (person.death && person.death < date.getFullYear()) return 'former';
    return 'nonOwner';
  };

  // Get warnings for events up to this date - only for people who had transfers
  const getWarningsForPerson = (personId) => {
    const relevantEvents = EVENTS.filter(e => e.date <= date);
    const warnings = [];
    relevantEvents.forEach(event => {
      if (event.warnings) {
        event.warnings.forEach(w => {
          if (w.personId === personId) {
            warnings.push(w);
          }
        });
      }
    });
    return warnings;
  };

  // Show spouse node if John is dead and date is after his death
  const showSpouseNode = date >= new Date('2020-09-20');
  // Show deed node if date is after deed transfer
  const showDeedNode = date >= new Date('2015-06-01');

  return (
    <div className="bg-gradient-to-br from-slate-50 to-blue-50 rounded-xl shadow-lg p-8 max-w-7xl mx-auto">
      <div className="mb-6">
        <div className="text-sm text-gray-500 mb-2">Property Location: North Carolina</div>
        <h2 className="text-2xl font-bold text-gray-800">
          Family Tree - {date.toLocaleDateString()}
        </h2>
      </div>
      
      <div className="space-y-8">
        {/* John's level with spouse */}
        <div className="flex flex-col items-center gap-6">
          <div className="flex items-start gap-8">
            <PersonNode
              person={PEOPLE.john}
              ownership={ownership.john}
              status={getStatus('john')}
              onExpand={TREE_STRUCTURE.john.children.length > 0 ? () => onToggleCollapse('john') : null}
              isCollapsed={collapsed.includes('john')}
            />
            
            {showSpouseNode && (
              <TransferNodeVisual type="SPOUSE" label="John's Surviving Spouse" />
            )}
            
            <PersonNode
              person={PEOPLE.susan}
              ownership={ownership.susan}
              status={getStatus('susan')}
            />
          </div>
          
          {!collapsed.includes('john') && (
            <>
              {/* Progeny node centered over all children */}
              <TransferNodeVisual type="PROGENY" label="John's Children" />
              
              {/* Grid layout for children with deed node */}
              <div className="grid grid-cols-3 gap-8 justify-items-center">
                {/* Column 1: Alice with deed above */}
                <div className="flex flex-col items-center gap-6">
                  {showDeedNode ? (
                    <TransferNodeVisual type="DEED" label="Deed from John" />
                  ) : (
                    <div className="h-10" />
                  )}
                  <PersonNode 
                    person={PEOPLE.alice} 
                    ownership={ownership.alice} 
                    status={getStatus('alice')} 
                  />
                </div>
                
                {/* Column 2: Bob - with matching spacer */}
                <div className="flex flex-col items-center gap-6">
                  <div className="h-10" />
                  <div className="flex flex-col items-center gap-4">
                    <PersonNode
                      person={PEOPLE.bob}
                      ownership={ownership.bob}
                      status={getStatus('bob')}
                      onExpand={TREE_STRUCTURE.bob.children.length > 0 ? () => onToggleCollapse('bob') : null}
                      isCollapsed={collapsed.includes('bob')}
                    />
                    
                    {!collapsed.includes('bob') && (
                      <>
                        <TransferNodeVisual type="PROGENY" label="Bob's Children" />
                        
                        <div className="flex gap-6">
                          <PersonNode 
                            person={PEOPLE.david} 
                            ownership={ownership.david} 
                            status={getStatus('david')} 
                          />
                          <PersonNode 
                            person={PEOPLE.emma} 
                            ownership={ownership.emma} 
                            status={getStatus('emma')} 
                          />
                          <PersonNode 
                            person={PEOPLE.frank} 
                            ownership={ownership.frank} 
                            status={getStatus('frank')}
                            warnings={getWarningsForPerson('frank')}
                          />
                        </div>
                      </>
                    )}
                  </div>
                </div>
                
                {/* Column 3: Charlie - with matching spacer */}
                <div className="flex flex-col items-center gap-6">
                  <div className="h-10" />
                  <PersonNode 
                    person={PEOPLE.charlie} 
                    ownership={ownership.charlie} 
                    status={getStatus('charlie')} 
                  />
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

function TransferEventView({ event, onBack }) {
  const [showDeed, setShowDeed] = useState(false);
  const source = PEOPLE[event.source];
  
  // Get ownership before and after
  const eventDateKey = event.date.toISOString().split('T')[0];
  const allDates = Object.keys(OWNERSHIP_STATES).sort();
  const beforeDateKey = allDates.filter(d => d < eventDateKey).pop() || '2010-01-01';
  const afterDateKey = allDates.find(d => d >= eventDateKey) || eventDateKey;
  
  const ownershipBefore = OWNERSHIP_STATES[beforeDateKey] || {};
  const ownershipAfter = OWNERSHIP_STATES[afterDateKey] || {};
  
  // Flatten recipients for final ownership display
  const getFinalRecipients = (recipients) => {
    const final = [];
    recipients.forEach(r => {
      if (r.passthrough) {
        // Add the passthrough recipients
        r.passthrough.forEach(p => final.push(p));
      } else {
        final.push(r);
      }
    });
    return final;
  };
  
  const finalRecipients = getFinalRecipients(event.recipients);
  
  return (
    <>
      {showDeed && event.deedDocument && (
        <DeedDocument deed={event.deedDocument} onClose={() => setShowDeed(false)} />
      )}
      
      <div className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-xl shadow-2xl p-8 max-w-6xl mx-auto">
        <div className="mb-4">
          <div className="text-sm text-gray-500">Property Location: North Carolina</div>
        </div>
        
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-3xl font-bold text-gray-800">
            Transfer Event: {event.label}
          </h2>
          <button
            onClick={onBack}
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
          >
            ← Back to Tree
          </button>
        </div>
        
        <div className="flex items-center gap-4 mb-4">
          <div className="text-sm text-gray-600">
            Date: {event.date.toLocaleDateString()}
          </div>
          {event.deedDocument && (
            <button
              onClick={() => setShowDeed(true)}
              className="text-sm px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors flex items-center gap-1"
            >
              <FileText size={16} />
              View Deed Document
            </button>
          )}
          {event.legalBasis && (
            <a
              href={event.legalBasis.url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700 transition-colors flex items-center gap-1"
            >
              <FileText size={16} />
              {event.legalBasis.statute}
            </a>
          )}
        </div>

        {/* Warnings */}
        {event.warnings && event.warnings.length > 0 && (
          <div className="mb-6 bg-yellow-50 border-2 border-yellow-400 rounded-lg p-4">
            <div className="flex items-start gap-2">
              <span className="text-2xl">⚠️</span>
              <div>
                <div className="font-bold text-yellow-900 mb-2">Missing Information</div>
                {event.warnings.map((warning, i) => (
                  <div key={i} className="text-yellow-800 text-sm mb-1">
                    • {warning.message}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
        
        {/* Source */}
        <div className="mb-8">
          <div className="text-xs uppercase tracking-wide text-gray-500 mb-2">Source</div>
          <div className="bg-white rounded-lg p-4 shadow">
            <div className="font-bold text-lg">{source.name}</div>
            <div className="text-sm text-gray-600 mt-2">
              {event.type === 'DEATH' ? 'Ownership at death:' : 'Ownership prior to transaction:'} <Fraction value={ownershipBefore[event.source] || '0'} />
            </div>
          </div>
        </div>
        
        {/* Transfer breakdown - showing intermediate steps */}
        <div className="mb-8">
          <div className="text-xs uppercase tracking-wide text-gray-500 mb-4">Transfer Breakdown</div>
          {event.legalBasis && (
            <div className="text-xs text-gray-600 mb-4 italic">
              Per {event.legalBasis.statute}: {event.legalBasis.title}
            </div>
          )}
          {event.preamble && (
            <div className="bg-blue-50 border-l-4 border-blue-500 p-4 mb-4 text-sm text-gray-700">
              {event.preamble}
            </div>
          )}
          <div className="space-y-3">
            {event.recipients.map((recipient, idx) => {
              const person = PEOPLE[recipient.id];
              const isDeceased = recipient.deceased;
              const sourceOwnership = ownershipBefore[event.source] || '0';
              
              return (
                <div key={recipient.id} className="bg-white rounded-lg shadow">
                  {/* Primary recipient */}
                  <div className={`p-4 ${isDeceased ? 'bg-gray-50' : ''}`}>
                    <div className="flex items-center gap-3">
                      <TransferNodeVisual type={recipient.via || 'PROGENY'} label={recipient.via || 'Progeny'} />
                      <div className="flex-1">
                        <div className="font-bold text-lg flex items-center gap-2">
                          {person.name}
                          {isDeceased && <span className="text-sm text-gray-500">† (deceased)</span>}
                        </div>
                        {recipient.explanation && (
                          <div className="text-sm text-gray-700 mt-2">
                            {recipient.explanation}
                          </div>
                        )}
                      </div>
                    </div>
                    
                    {/* Passthrough if deceased */}
                    {isDeceased && recipient.passthrough && (
                      <div className="mt-4 ml-12 pl-4 border-l-2 border-purple-300">
                        <div className="text-xs uppercase tracking-wide text-gray-500 mb-3">
                          Distributed to {person.name}'s children (per stirpes):
                        </div>
                        <div className="space-y-3">
                          {recipient.passthrough.map(p => {
                            const pPerson = PEOPLE[p.id];
                            return (
                              <div key={p.id} className="flex items-center gap-3">
                                <TransferNodeVisual type={p.via || 'PROGENY'} label={p.via || 'Progeny'} />
                                <div className="flex-1">
                                  <div className="font-semibold text-sm">{pPerson.name}</div>
                                  {p.explanation && (
                                    <div className="text-xs text-gray-700 mt-1">
                                      {p.explanation}
                                    </div>
                                  )}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
        
        {/* Final recipients - actual ownership changes */}
        <div>
          <div className="text-xs uppercase tracking-wide text-gray-500 mb-4">Final Ownership Changes</div>
          <div className="grid grid-cols-2 gap-4">
            {finalRecipients.map(recipient => {
              const person = PEOPLE[recipient.id];
              return (
                <div key={recipient.id} className="bg-white rounded-lg p-4 shadow">
                  <div className="font-bold text-lg">{person.name}</div>
                  <div className="mt-3 space-y-1 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Pre-event:</span>
                      <Fraction value={ownershipBefore[recipient.id] || '0'} />
                    </div>
                    <div className="flex justify-between text-emerald-700 font-semibold">
                      <span>Via transfer:</span>
                      <Fraction value={recipient.fraction} />
                    </div>
                    <div className="flex justify-between border-t pt-1">
                      <span className="text-gray-600">Post-event:</span>
                      <Fraction value={ownershipAfter[recipient.id] || '0'} />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </>
  );
}

export default function TreeBuilder() {
  const [viewMode, setViewMode] = useState('TREE'); // 'TREE' or 'TRANSFER'
  const [currentDate, setCurrentDate] = useState(new Date('2021-05-16'));
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [collapsed, setCollapsed] = useState([]);
  const [isTransitioning, setIsTransitioning] = useState(false);

  const handleEventClick = (event) => {
    setIsTransitioning(true);
    setSelectedEvent(event);
    setTimeout(() => {
      setViewMode('TRANSFER');
      setIsTransitioning(false);
    }, 300);
  };

  const handleBackToTree = () => {
    setIsTransitioning(true);
    setTimeout(() => {
      setViewMode('TREE');
      setSelectedEvent(null);
      setIsTransitioning(false);
    }, 300);
  };

  const toggleCollapse = (personId) => {
    setCollapsed(prev =>
      prev.includes(personId)
        ? prev.filter(id => id !== personId)
        : [...prev, personId]
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-100 via-purple-100 to-pink-100 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-5xl font-bold text-gray-900 mb-2">
            Tree Builder
          </h1>
          <p className="text-gray-600">Property Ownership Visualization</p>
        </div>

        {/* Timeline */}
        <Timeline
          events={EVENTS}
          currentDate={currentDate}
          onDateChange={setCurrentDate}
          onEventClick={handleEventClick}
        />

        {/* Main content with transition */}
        <div className={`transition-opacity duration-300 ${isTransitioning ? 'opacity-0' : 'opacity-100'}`}>
          {viewMode === 'TREE' ? (
            <TreeView
              date={currentDate}
              collapsed={collapsed}
              onToggleCollapse={toggleCollapse}
            />
          ) : (
            <TransferEventView
              event={selectedEvent}
              onBack={handleBackToTree}
            />
          )}
        </div>

        {/* Legend */}
        <div className="mt-8 bg-white rounded-xl shadow-lg p-6">
          <h3 className="text-lg font-bold text-gray-800 mb-4">Legend</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded bg-gradient-to-br from-emerald-500 to-teal-600" />
              <span className="text-sm text-gray-700">Current Owner</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded bg-gradient-to-br from-slate-400 to-slate-500" />
              <span className="text-sm text-gray-700">Former Owner</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded bg-gradient-to-br from-blue-400 to-indigo-500 opacity-60" />
              <span className="text-sm text-gray-700">Future Owner</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded bg-gradient-to-br from-gray-200 to-gray-300" />
              <span className="text-sm text-gray-700">Non-Owner</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
