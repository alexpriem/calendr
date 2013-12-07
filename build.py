import pyodbc
import argparse
from jinja2 import Environment, Template


class calendar:
    def __init__ (self):
        pass

    def build_calendar(self):
        pass
    
    def build_data(self,args):
        lines=open("data/orig/knmi_hvh_2009.txt","r").readlines()

        firstline=True
        js='var data=[\n'
        for line in lines:
            line=line.strip();
            if line[0]=='#':
                continue
            js+='['+line+'],\n'
        js=js[:-2]+'];\n';
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

parser.add_argument('-html', dest='htmlfile',  help='name of html outputfile', required=False, default=True, action='store_true')
parser.add_argument('-records', dest='records',  help='record description', required=False, default=True, action='store_true')

args=vars(parser.parse_args())




c=calendar()
c.build_calendar()
js=c.build_data(args)
c.write_html (js,args)
