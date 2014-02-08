import sys
import argparse


   


def splitter (csv,sep,out,keys,verbose):
    f=open(csv+'.csv','r')
    g=None
    prevkey=None
    key=None
    cols=f.readline()
    t=0
    for line in f:
        cols=line.split(sep)        
        key=cols[0]
        t+=1
        if key!=prevkey or prevkey is None:            
            if g is not None:              
                g.close()
                g=None
            prevkey=key
            if verbose:
                print key, keys is not None and key not in keys
            if keys is not None and key not in keys:
                continue            
            g=open(csv+'_'+key+'.csv','w')            
        if g is not None:
            g.write(','.join(cols[1:]).strip()+'\n')
    if g is not None:            
        g.close()



# asume first col is key to split by
# if keys not None, only dump records with key in keys []
# second col is date, so wrap in 'Date('')' syntax

def js_splitter (csv,sep,out,keys,verbose):
    
    f=open(csv+'.csv','r')
    g=None
    prevcol=None
    cols=f.readline()    
    cols=cols.split(sep)
    comment=','.join(cols[1:])
    header='var sdata=[ \n//'+comment
    footer='];'
    for line in f:
        cols=line.split(sep)
        if  cols[0]!=prevcol or prevcol is None:
            if g is not None:
                g.write(footer)
                g.close()
                g=None
            key=cols[0]
            prevcol=key
            if verbose:
                print key            
            if keys is not None and key not in keys:
                continue
            g=open(csv+'_'+key+'.js','w')            
            g.write(header)

        if g is not None:            
            d="Date('"+cols[1]+"'),"
            s='['+d+','.join(cols[2:]).strip()+'],\n'
            g.write(s)
            
    if g is not None:
        g.write(footer)
        g.close()




parser = argparse.ArgumentParser(description='generate calendar from repeating data')

parser.add_argument('-c', '--csv', dest='csv',  help='csv input file name', required=False)
parser.add_argument('-s', dest='sep',  help='separator', required=False, default=',')
parser.add_argument('-js', dest='js',  help='javascript output', required=False,  action='store_true', default=False)
parser.add_argument('-v', dest='verbose',  help='print progress', required=False,  action='store_true', default=False)
parser.add_argument('-o', dest='out',  help='output prefix', required=False, default='')
parser.add_argument('-k', '--key', dest='key',  help='extract only data with key=key (multiple values allowed, seperated by commas)', required=False)
args=vars(parser.parse_args())

csv=args['csv']
sep=args['sep']
js=args['js']
key=args['key']
keys=None
if key is not None:
    keys=key.split(',')
out=args['out']
if out=='':
    out=csv
verbose=args['verbose']



if js:
    js_splitter(csv,sep,out,keys,verbose)
else:
    splitter(csv,sep,out,keys,verbose)
