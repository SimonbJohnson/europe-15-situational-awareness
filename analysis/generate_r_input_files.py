def createList(data,subject,subjectname,startdate,enddate,lagstart,lagend,exclude,filename):
    datamat = []
    output=[]
    row=['date','y']
    for l in range(lagstart,lagend+1):
        for column in data.without_columns(exclude+['date']+[subjectname]).columns:
            row.append(str(column)+'.'+str(l))
            
    print exclude
    output.append(row)
    
    for row in data.without_columns(exclude).gen_raw(show_headers=False, show_tags=True):
        datamat.append(row)

    i=0
    start= False
    end=False
    for line in datamat:        
        row=[]
        if(line[0]==startdate):
            start=True
        if(start==True and end==False):
            NA = False
            row.append(line[0])
            row.append(line[subject])
            if(line[subject]=='N/A'):
                NA = True
            for l in range(lagstart,lagend+1):
                for e in range(1,len(line)):
                    if(e<>subject):
                        row.append(datamat[i-l][e])
                        if(datamat[i-l][e]=='N/A'):
                            NA = True
            if(NA == False):
                output.append(row)
        i+=1
        if(line[0]==enddate):
            end=True
    print "Writing output"
    with open(filename, "wb") as f:
        writer = csv.writer(f)
        writer.writerows(output)

import hxl
import csv
url = 'https://docs.google.com/spreadsheets/d/15OC8U1lodClWj0LQ3dUi3sR1emtZxQx5ZDOIPZFgwgM/pub?gid=0&single=true&output=csv'

data = hxl.data(url)
createList(data,7,'#affected+arriveaustria','15/02/2016','07/03/2016',1,7,['#affected+arrivehungary'],'austriarinput.csv')

data = hxl.data(url)
createList(data,6,'#affected+arriveslovenia','15/02/2016','07/03/2016',1,7,['#affected+arrivehungary','#affected+arriveaustria'],'sloveniarinput.csv')

data = hxl.data(url)
createList(data,5,'#affected+arrivecroatia','15/02/2016','07/03/2016',1,7,['#affected+arrivehungary','#affected+arriveaustria','#affected+arriveslovenia'],'croatiarinput.csv')

data = hxl.data(url)
createList(data,4,'#affected+arriveserbia','15/02/2016','07/03/2016',1,7,['#affected+arrivehungary','#affected+arriveaustria','#affected+arriveslovenia','#affected+arrivecroatia'],'serbiarinput.csv')

data = hxl.data(url)
createList(data,3,'#affected+arrivefyrom','15/02/2016','07/03/2016',1,7,['#affected+arrivehungary','#affected+arriveaustria','#affected+arriveslovenia','#affected+arrivecroatia','#affected+arriveserbia'],'fyromrinput.csv')

data = hxl.data(url)
createList(data,2,'#affected+arrivemainlandgreece','15/02/2016','07/03/2016',1,7,['#affected+arrivehungary','#affected+arriveaustria','#affected+arriveslovenia','#affected+arrivecroatia','#affected+arrivefyrom','#affected+arriveserbia'],'greecerinput.csv')
