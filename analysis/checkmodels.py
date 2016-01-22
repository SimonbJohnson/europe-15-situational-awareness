import csv
import hxl

def checkModel(modelfile,actual,startDate,endDate):
    model = loadAndProcessModel(modelfile)
    testData = createTestData(model,actual,startDate,endDate)
    print modelfile
    print model
    runModel(model,testData)

def runModel(model,testData):
    errorabsum = 0
    percentabsum = 0
    count = 0
    for line in testData[1:]:
        NA = False
        estimate = float(model[1][2])
        if(is_number(line[1]) == False):
             NA = True
        for i in range(2,len(model)):
            if(NA == False):
                if(is_number(line[i]) == False):
                    NA = True
                    estimate = "N/A"
                else:
                    indvar = float(line[i])
                    coef = float(model[i][2])
                    estimate += indvar*coef                    
        if(NA == False):
            count = count+1
            error = int(line[1]) - float(estimate)
            errorabsum += abs(error)
            percentabsum += abs(error/float(estimate))
            percent = "{0:.2f}".format(error/float(estimate)*100) + "%"
        else:
            error = "N/A"
            percent = "N/A"
        print line[0] + " - " + line[1] + " - " + str(estimate) + " - " + str(error) + " - " + percent
    erroravg = errorabsum/(count)
    percentavg = percentabsum/(count)

    print erroravg
    #print percentavg
    
def createTestData(model,actual,startDate,endDate):
    url = 'https://docs.google.com/spreadsheets/d/15OC8U1lodClWj0LQ3dUi3sR1emtZxQx5ZDOIPZFgwgM/pub?gid=0&single=true&output=csv'
    data = hxl.data(url)
    datamat = []
    output=[]
    row=['date','actual']
    for line in model[2:]:
        row.append(line[1])

    output.append(row)
    
    for row in data.gen_raw(show_headers=False, show_tags=True):
        datamat.append(row)

    cols = {}
    for i in range(1,len(datamat[0])):
        cols[datamat[0][i][10:]] = i

    i=0
    start= False
    end=False        
    for line in datamat:
        row=[]
        if(line[0]==startDate):
            start=True
        if(start==True and end==False):
            row.append(line[0])
            row.append(line[cols[actual]])
            for e in output[0][2:]:
                att = e.split(".")
                lag = att[3]
                r = i-int(lag)
                c = cols[att[2]]
                row.append(datamat[r][c])
            output.append(row)
        i+=1
        if(line[0]==endDate):
            end=True

    return output
    
            
def loadAndProcessModel(modelfile):
    with open(modelfile, 'rb') as csvfile:
        m = csv.reader(csvfile, delimiter=',', quotechar='"')
        return list(m)

def is_number(s):
    try:
        float(s)
        return True
    except ValueError:
        return False    

checkModel('models/austriamodel1','arriveaustria','14/12/2015','16/01/2016')
checkModel('models/austriamodel2','arriveaustria','14/12/2015','16/01/2016')
checkModel('models/austriamodel3','arriveaustria','14/12/2015','16/01/2016')
checkModel('models/austriamodel4','arriveaustria','14/12/2015','16/01/2016')
checkModel('models/austriamodel5','arriveaustria','14/12/2015','16/01/2016')
checkModel('models/sloveniamodel1','arriveslovenia','14/12/2015','16/01/2016')
checkModel('models/sloveniamodel2','arriveslovenia','14/12/2015','16/01/2016')
checkModel('models/sloveniamodel3','arriveslovenia','14/12/2015','16/01/2016')
checkModel('models/sloveniamodel4','arriveslovenia','14/12/2015','16/01/2016')
checkModel('models/sloveniamodel5','arriveslovenia','14/12/2015','16/01/2016')
checkModel('models/croatiamodel1','arrivecroatia','14/12/2015','16/01/2016')
checkModel('models/croatiamodel2','arrivecroatia','14/12/2015','16/01/2016')
checkModel('models/croatiamodel3','arrivecroatia','14/12/2015','16/01/2016')
checkModel('models/croatiamodel4','arrivecroatia','14/12/2015','16/01/2016')
checkModel('models/croatiamodel5','arrivecroatia','14/12/2015','16/01/2016')
checkModel('models/serbiamodel1','arriveserbia','14/12/2015','16/01/2016')
checkModel('models/serbiamodel2','arriveserbia','14/12/2015','16/01/2016')
checkModel('models/serbiamodel3','arriveserbia','14/12/2015','16/01/2016')
checkModel('models/serbiamodel4','arriveserbia','14/12/2015','16/01/2016')
checkModel('models/serbiamodel5','arriveserbia','14/12/2015','16/01/2016')
checkModel('models/fyrommodel1','arrivefyrom','14/12/2015','16/01/2016')
checkModel('models/fyrommodel2','arrivefyrom','14/12/2015','16/01/2016')
checkModel('models/fyrommodel3','arrivefyrom','14/12/2015','16/01/2016')
checkModel('models/fyrommodel4','arrivefyrom','14/12/2015','16/01/2016')
checkModel('models/fyrommodel5','arrivefyrom','14/12/2015','16/01/2016')
checkModel('models/greecemodel1','arrivemainlandgreece','14/12/2015','16/01/2016')
checkModel('models/greecemodel2','arrivemainlandgreece','14/12/2015','16/01/2016')
checkModel('models/greecemodel3','arrivemainlandgreece','14/12/2015','16/01/2016')
checkModel('models/greecemodel4','arrivemainlandgreece','14/12/2015','16/01/2016')
checkModel('models/greecemodel5','arrivemainlandgreece','14/12/2015','16/01/2016')
