import csv
import json
from collections import defaultdict

# Read CSV
with open('UI5con.csv', 'r', encoding='utf-8') as f:
    data = list(csv.DictReader(f))

sessions_by_time = defaultdict(list)
breaks = []

for row in data:
    if not row['time'] or not row['time'].strip():
        continue
    
    time = row['time'].strip()
    typ = row['type'].strip() if row['type'] else ''
    
    if typ.lower() == 'break':
        breaks.append({
            'time': time,
            'title': row['tracktitle'].strip() if row['tracktitle'] else ''
        })
    elif typ:
        sessions_by_time[time].append({
            'title': row['tracktitle'].strip() if row['tracktitle'] else '',
            'sp1': row['speaker1'].strip() if row['speaker1'] else '',
            'sp2': row['speaker2'].strip() if row['speaker2'] else '',
            'sp3': row['speaker3'].strip() if row['speaker3'] else '',
            'track': row['session_tracktitle'].strip() if row['session_tracktitle'] else ''
        })

# Build JSON
result = {'ui5': []}

# Add initial breaks
for b in breaks[:3]:
    if 'Arrival' in b['title']:
        result['ui5'].append({
            'sequence': '0.1',
            'time': b['time'],
            'type': 'commute',
            'tracktitle': b['title'],
            'sessionsBySequence': []
        })
    elif 'Keynote from Sindhu' in b['title']:
        result['ui5'].append({
            'sequence': '0.3',
            'time': b['time'],
            'type': 'keynote',
            'tracktitle': b['title'],
            'sessionsBySequence': []
        })
    elif 'Industry Talk' in b['title']:
        result['ui5'].append({
            'sequence': '0.4',
            'time': b['time'],
            'type': 'industry-talk',
            'tracktitle': b['title'],
            'sessionsBySequence': []
        })

# Add session slots
seq_num = 1
for time in sorted(sessions_by_time.keys()):
    sessions_list = []
    for idx, s in enumerate(sessions_by_time[time]):
        session = {
            'speakers': '',
            'speaker1': s['sp1'],
            'speaker2': s['sp2'],
            'speaker1_social': '',
            'speaker2_social': '',
            'sessiontitle': s['title'],
            'description': '',
            'organization1': '',
            'socialmedia': '',
            'sessionseq': str(idx + 1),
            'tracktitle': s['track'],
            'trackid': s['track'],
            'trackseq': str(idx + 1),
            'type': 'UI5 Session'
        }
        if s['sp3']:
            session['speaker3'] = s['sp3']
        sessions_list.append(session)
    
    result['ui5'].append({
        'sequence': str(seq_num),
        'time': time,
        'type': 'grid',
        'tracktitle': '<Not Required>',
        'sessionsBySequence': sessions_list
    })
    seq_num += 1

# Add lunch
for b in breaks:
    if 'Lunch' in b['title']:
        result['ui5'].append({
            'sequence': str(seq_num + 0.5),
            'time': b['time'],
            'type': 'break',
            'tracktitle': b['title'],
            'sessionsBySequence': []
        })

# Add closing
result['ui5'].append({
    'sequence': str(seq_num + 1),
    'time': '04:00 - 04:30',
    'type': 'break',
    'tracktitle': 'Closing Ceremony, Group Photo & High Tea',
    'sessionsBySequence': []
})

# Write JSON
with open('ui5.json', 'w', encoding='utf-8') as f:
    json.dump(result, f, indent=4, ensure_ascii=False)

print(f'✓ Converted CSV to JSON')
print(f'✓ Total time slots: {len(result["ui5"])}')
print(f'✓ Session slots: {sum(1 for item in result["ui5"] if item["type"] == "grid")}')
