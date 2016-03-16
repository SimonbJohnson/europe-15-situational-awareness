import csv
import os
import json

def loadAndProcessModel(modelfile):
    with open(modelfile, 'rb') as csvfile:
        m = csv.reader(csvfile, delimiter=',', quotechar='"')
        return list(m)

models = {}

for f in os.listdir("models"):
    parts = f.split('model')
    if parts[0] not in models:
        models[parts[0]] = {}
    models[parts[0]][parts[1]] = []
    model = loadAndProcessModel('models/'+f)
    i=0
    for line in model:
        if i>0:
          models[parts[0]][parts[1]].append({'var':line[1],'coef':line[2]})
        i+=1
    
with open('15Feb16_07Mar16.json', 'w') as outfile:
    json.dump(models, outfile)
