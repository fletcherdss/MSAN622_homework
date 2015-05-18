import regex as re
from importlib import reload
import json

#l = s.lines()
#names = [n.split('–')[0].lstrip(' ').rstrip(' ') for n in l] 
names = [
    ('Richard Shelton', 'Dick'),
    ('Clipsby',),
    ('Bennet Hatch','Hatch', 'Bennet'),
    ('Nicholas Appleyard','Appleyard'),
    ('Sir Oliver Oates','Sir Oliver'),
    ('Sir Daniel Brackley','Sir Daniel'),
    ('Joanna Sedley','Joanna', 'John Matcham'),
    ('Selden',),
    ('Will Lawless','Lawless', 'Brother Honestus'),
    ('Ellis Duckworth',),
    ('Kit Greensheve', 'Christopher'),
    ('John Capper',),
    ('Goody Hatch',),
    ('Lord Foxham',),
    ('Sir John Hamley',),
    ('Hawksley',),
    ('Earl Risingham',),
    ('Alicia Risingham','Alicia'),
    ('Lord Shoreby',),
    ('Captain Arblaster','Arblaster'),
    ('Tom',),
    ('Master Pirret','Pirret'),
    ('Richard Crookback','Richard Plantagenet', 'Richard III'),
    ('Sir William Catesby','Sir William')
]


def extract_characters(line):
    matches = []
    for name_bunch in names:
        a = re.findall('|'.join(name_bunch), line)
        matches += [name_bunch[0]] * len(a)
    return matches

with open("pg32954.txt") as f:
    ls = f.readlines()
with open("blackar.txt", 'w') as f:
    json.dump(list(map(extract_characters, ls)), f)

matches = list(enumerate(map(extract_characters, ls)))

matchedPages = []
a = []

for i, m in matches:
    a += m
    if i % 30 == 0:
        matchedPages.append(sorted(list(set(a))))
        a = []

print(matchedPages)
