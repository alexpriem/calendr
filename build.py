import sys, json, argparse
from datetime import datetime
import dateutil.parser




class calendar:
    def __init__ (self):
        pass

    def build_calendar(self):
        pass
    
    def build_data(self,args):

        recordinfo=args['recordinfo']
        dateformat=args['dateformat']
        sep=args['separator']
        if recordinfo is None:
            raise RuntimeError('recordinfo needed, add -record to cmdline')
        cols=recordinfo.split(',')
        cols=[col.strip() for col in cols]
        csv=args['csv']
        f=open(csv,"r")
        js=''
        varnames=f.readline().strip().split(sep);
        

        c=0
        key=None
        keyindex=None
        vartypes=[]
        if 'key' in cols:
            keyindex=cols.index('key')
            vartypes.append('key')
            c+=1
        keyidindex=None
        if 'keyid' in cols:
            keyidindex=cols.index('keyid')
            vartypes.append('keyid')
            c+=1
        if not('date' in cols):
            raise  RuntimeError('date-col needed in record')
        c+=1
        dateindex=cols.index('date')
        vartypes.append('date')
        datacolnames=[];
        dataindex=[];
        new_dataindex=[]
        for i,col in enumerate(cols):
            if col=='data':                
                datacolnames.append(varnames[i])
                vartypes.append('data')
                dataindex.append(i)
                new_dataindex.append(c)
                c+=1
        
        
        
        s=json.dumps(vartypes)
        js+='var var_types='+s+';\n';
        s=json.dumps(varnames)        
        js+='var var_names='+s+';\n';
        s=json.dumps(datacolnames)        
        js+='var data_names='+s+';\n';
        s=json.dumps(new_dataindex)        
        js+='var data_index='+s+';\n';
        
        firstline=True
        js+='var data=[\n'
        prevkey=''
        index_start={}
        index_end={}
        linenr=0
        datedelta=None
        prevdate=None
        mindate=None
        maxdate=None
        for line in f.readlines():
            line=line.strip();            
            if len(line)==0 or line[0]=='#':
                continue
            datacols=line.split(sep)
            datacols=[datacol.strip() for datacol in datacols]
            js+='['
            keyval=''
            if keyindex is not None:
                keyval=datacols[keyindex]
            if keyidindex is not None:
                keyval=datacols[keyidindex]
            if keyval!='':
                js+=keyval+','
                if keyval!=prevkey:
                    if prevkey is not None:
                        index_end[prevkey]=linenr
                    index_start[keyval]=linenr
                    prevkey=keyval
                    
            # date parsen en afhandelen
            datestring=datacols[dateindex]            
            #dateval=datetime.strptime(datestring,dateformat)
            dateval=dateutil.parser.parse(datestring)
            if prevdate is not None:
                datediff=dateval-prevdate
                
                if datedelta is None and datediff.total_seconds()>0:
                    datedelta=datediff                    
                if datediff.total_seconds()!=0 and (datediff<datedelta) and datediff.total_seconds()>0:
                    datedelta=datediff
            prevdate=dateval
            if mindate is None:
                mindate=dateval
            if maxdate is None:
                maxdate=dateval
            if dateval<mindate:
                mindate=dateval                
            if dateval>maxdate:
                maxdate=dateval
                
            js+="new Date('"+dateval.isoformat()+"'),"
            
            js+=','.join([datacols[d] for d in dataindex])
            js+='],\n'
            linenr+=1
            
        js=js[:-2]+'];\n\n';
        if keyval!='':
            index_end[keyval]=linenr;            
        

        # dit kan in json, maar JSON-data wordt een stuk onleesbaarder dan (op een regel)
        keyfile=args['keyfile']
        if keyfile is not None:
            f=open(keyfile,'r')
            f.readline()   # skip header
            id2keyjs='id2key={'
            key2idjs='key2id={'
            keylabeljs='keylabel=['
            for line in f.readlines():
                line=line.split(',')
                keylabel=line[1].strip()
                keyid=line[0].strip()
                id2keyjs+='"'+keyid+'":"'+keylabel+'",\n'
                key2idjs+='"'+keylabel+'":'+keyid+',\n'
                keylabeljs+='"'+keylabel+'",\n'
            id2keyjs=id2keyjs[:-2]+'};\n\n'
            key2idjs=key2idjs[:-2]+'};\n\n'
            keylabeljs=keylabeljs[:-2]+'];\n\n'
            js+=key2idjs;
            js+=id2keyjs;
            js+=keylabeljs;

            f.seek(0)
            line=f.readline().strip().split(',')
            js+='var selected_keylabel=keylabel[0];\n'
            js+='var selected_keyid=key2id[selected_keylabel];\n'
        else:
            js+='var selected_keylabel="";\n'
            js+='var selected_keyid="";\n'


        s=json.dumps(index_start)
        js+='\n\nvar index_start='+s+';\n';
        s=json.dumps(index_end)
        js+='var index_end='+s+';\n';

        js+="var min_date=new Date('"+mindate.isoformat()+"');\n"
        js+="var max_date=new Date('"+maxdate.isoformat()+"');\n"

        if datedelta.days>7:
            reprange='month';
            dateperiod=31*24*3600*1000;
        if datedelta.days>0 and datedelta.days<=7:
            reprange='week';
            dateperiod=7*24*3600*1000;
        if datedelta.days==0 and datedelta.seconds>600:
            reprange='day'
            dateperiod=24*3600*1000;
        if datedelta.days==0 and datedelta.seconds<600:
            reprange='hour'
            dateperiod=3600*1000;
        js+='var reprange="'+reprange+'";\n'
        js+='var datePeriod='+str(dateperiod)+';\n'
        
        
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

group = parser.add_mutually_exclusive_group(required=True)
group.add_argument('-c', '--csv', dest='csv',  help='csv input file name')
group.add_argument('-jsdir', '--jsdir', dest='jsdir',  help='directory with js files')
parser.add_argument('-html', dest='htmlfile',  help='name of html outputfile', required=False)
parser.add_argument('-record', dest='recordinfo',  help='record description: key,keyid,date,hour,datalabel,dummy', required=True)
parser.add_argument('-s', '--separator', dest='separator',  help='separator', required=False, default=',')
parser.add_argument('-df', '--dateformat', dest='dateformat',  help='date format (strptime style)')
parser.add_argument('-keyfile', dest='keyfile',  help='for mapping keyids to keylabels', required=False)
parser.add_argument('-d','--dirfile', dest='dirfile',  help='for mapping directory keys to labels', required=False)
args=vars(parser.parse_args())




c=calendar()
c.build_calendar()
js=c.build_data(args)
c.write_html (js,args)
