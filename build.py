import sys, json, argparse



class calendar:
    def __init__ (self):
        pass

    def build_calendar(self):
        pass
    
    def build_data(self,args):

        recordinfo=args['recordinfo']
        sep=args['separator']
        if recordinfo is None:
            raise RuntimeError('recordinfo needed, add -record to cmdline')
        cols=recordinfo.split(',')
        cols=[col.strip() for col in cols]
        
        c=0
        key=None
        keyindex=None
        if 'key' in cols:
            keyindex=cols.index('key')
            c+=1
        keyidindex=None
        if 'keyid' in cols:
            keyidindex=cols.index('keyid')
            c+=1
        if not('date' in cols):
            raise  RuntimeError('date-col needed in record')      
        dateindex=cols.index('date')        
        datacolnames=[];
        for col in cols:
            if col not in ['key','keyid','date','dummy']:
                datacolnames.append(col)
        dataindex=[]
        for datacolname in datacolnames:
            dataindex.append(cols.index(datacolname))
        print dataindex

        js='var meta=[';
        if keyindex is not None:
            js+='"key",'
        if keyidindex is not None:
            js+='"keyid",'
        js+='"date",'
        js+='"'+'","'.join(datacolnames)
        js+='"];\n\n'
        
        csv=args['csv']
        lines=open(csv,"r").readlines()
                
        firstline=True
        js+='var data=[\n'
        prevkey=''
        index_start={}
        index_end={}
        linenr=0
        for line in lines:
            line=line.strip();            
            if line[0]=='#':
                continue
            datacols=line.split(sep)
            datacols=[datacol.strip() for datacol in datacols]
            js+='['
            keyval=''
            if keyindex is not None:
                keyval=datacols[keyindex]
            if keyidindex is not None:
                keyval=datacols[keyidindex]
            js+=keyval
            if keyval!=prevkey:
                if prevkey is not None:
                    index_end[prevkey]=linenr
                index_start[keyval]=linenr
                prevkey=keyval
                            
            js+=",Date('"+datacols[dateindex]+"')"            
            js+=','+','.join([datacols[d] for d in dataindex])
            js+='],\n'
            linenr+=1
            
        js=js[:-2]+'];\n\n';
        index_end[keyval]=linenr;


        # dit kan in json, maar wordt een stuk onleesbaarder dan
        keyfile=args['keyfile']
        if keyfile is not None:
            f=open(keyfile,'r')
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
            js+='selected_keylabel=keylabel[0];\n'
            js+='selected_keyid=key2id[selected_keylabel];\n'


        s=json.dumps(index_start)
        js+='\n\n var index_start='+s+';\n';
        s=json.dumps(index_end)
        js+='\n\n var index_end='+s+';\n';
            
            
        
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
parser.add_argument('--html', dest='htmlfile',  help='name of html outputfile', required=False)
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
