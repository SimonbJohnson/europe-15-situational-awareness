def createLists(data):
    for row in data:
        print row

from hxl import hxl
url = 'https://docs.google.com/spreadsheets/d/15OC8U1lodClWj0LQ3dUi3sR1emtZxQx5ZDOIPZFgwgM/pub?gid=0&single=true&output=csv'
data = hxl(url)
#print "Validation: "+ str(data.validate())
createLists(data)


