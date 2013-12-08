import pyodbc,sys
import argparse
from jinja2 import Environment, Template


class calendar:
    def __init__ (self):
        pass

    def build_calendar(self):
        pass
    
    def build_data(self,args):

        

        recordinfo=args['recordinfo']
        if recordinfo is None:
            raise RuntimeError('recordinfo needed, add -record to cmdline')
        cols=recordinfo.split(',')
        cols=[col.strip() for col in cols]
        key=None
        c=0
        if 'key' in cols:
            keyindex=cols.index('key')
            c+=1
        keyidindex=None
        if 'keyid' in cols:
            keyidindex=cols.index('keyid')
            c+=1
        if not('date' in cols):
            raise  RuntimeError('date-col needed in record')
        if not('hour' in cols):
            raise  RuntimeError('date-col needed in record')
        dateindex=cols.index('date')
        hourindex=cols.index('hour')
        datacolnames=[];
        for col in cols:
            if col not in ['key','keyid','date','hour','dummy']:
                datacolnames.append(col)
        dataindex=[]
        for datacolname in datacolnames:
            dataindex.append(cols.index(datacolname))

        js='var meta=[';
        if keyindex is not None:
            js+='"key",'
        if keyidindex is not None:
            js+='"keyid",'
        js+='"date","hour",'
        js+='"'+'","'.join(datacolnames)
        js+='"];\n\n'
        
        csv=args['csv']
        lines=open(csv,"r").readlines()
                
        firstline=True
        js+='var data=[\n'
        for line in lines:
            line=line.strip();            
            if line[0]=='#':
                continue
            datacols=line.split(',')
            datacols=[datacol.strip() for datacol in datacols]
            js+='['
            if keyindex is not None:
                js+=datacols[keyindex]            
            js+=','+datacols[dateindex]
            js+=','+datacols[hourindex]            
            js+=','+','.join([datacols[d] for d in dataindex])
            js+='],\n'
            
            
        js=js[:-2]+'];\n\n';

        
        keyfile=args['keyfile']
        if keyfile is not None:
            f=open(keyfile,'r')
            id2keyjs='id2key={'
            key2idjs='key2id={'
            for line in f.readlines():
                line=line.split(',')
                id2keyjs+='"'+line[0]+'":"'+line[1].strip()+'",\n'
                key2idjs+='"'+line[1].strip()+'":'+line[0]+',\n'
            id2keyjs=id2keyjs[:-2]+'};\n\n'
            key2idjs=key2idjs[:-2]+'};\n\n'
            js+=key2idjs;
            js+=id2keyjs;
                
            
        
        g=open("js/data.js","w");
        g.write(js)
        g.close()
        pass

    def write_html (self, js, args):
        pass
    
        



parser = argparse.ArgumentParser(description='generate calendar from repeating data')

#parser.add_argument('-s', dest='server', help='server', required=True)
#parser.add_argument('-db', dest='database',  help='set database', required=True)
#parser.add_argument('-u', dest='username',  help='username', required=False)
#parser.add_argument('-p', dest='password',  help='password', required=False)

parser.add_argument('-c', '--csv', dest='csv',  help='csv input file name', required=True)
parser.add_argument('-html', dest='htmlfile',  help='name of html outputfile', required=False, default=True, action='store_true')
parser.add_argument('-record', dest='recordinfo',  help='record description: key,keyid,date,hour,datalabel,dummy', required=True)
parser.add_argument('-keyfile', dest='keyfile',  help='for mapping keyids to keylabels', required=False)

args=vars(parser.parse_args())




c=calendar()
c.build_calendar()
js=c.build_data(args)
c.write_html (js,args)
