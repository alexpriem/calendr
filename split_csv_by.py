import sys
import argparse


   


def splitter (csv,sep,out,verbose):
    f=open(csv+'.csv','r')
    g=None
    prevcol=None
    cols=f.readline()    
    for line in f:
        cols=line.split(sep)
        if  cols[0]!=prevcol or prevcol is None:
            if g is not None:
                g.write(footer)
                g.close()
            if verbose:
                print cols[0]
            g=open(csv+'_'+cols[0]+'.csv','w')
            prevcol=cols[0]
            g.write(','.join(cols[1:]).strip()+'\n')
    g.write(footer)
    g.close()



# asume first col is splitter
# second col is date, so wrap in 'Date('')' syntax

def js_splitter (csv,sep,out,verbose):
    
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
            if verbose:
                print cols[0]
            g=open(csv+'_'+cols[0]+'.js','w')
            g.write(header)
            prevcol=cols[0]        
        d="Date('"+cols[1]+"'),"
        s='['+d+','.join(cols[2:]).strip()+'],\n'
        g.write(s)
        
    g.write(footer)
    g.close()




parser = argparse.ArgumentParser(description='generate calendar from repeating data')

parser.add_argument('-c', '--csv', dest='csv',  help='csv input file name', required=False)
parser.add_argument('-s', dest='sep',  help='separator', required=False, default=',')
parser.add_argument('-js', dest='js',  help='javascript output', required=False,  action='store_true', default=False)
parser.add_argument('-v', dest='verbose',  help='print progress', required=False,  action='store_true', default=False)
parser.add_argument('-o', dest='out',  help='output prefix', required=False, default='')
args=vars(parser.parse_args())

csv=args['csv']
sep=args['sep']
js=args['js']
out=args['out']
if out=='':
    out=csv
verbose=args['verbose']



if js:
    js_splitter(csv,sep,out,verbose)
else:
    splitter(csv,sep,out,verbose)
