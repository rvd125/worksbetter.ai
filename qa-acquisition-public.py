import urllib.request,urllib.error,ssl,os,json,hashlib,pathlib
from bs4 import BeautifulSoup
root=pathlib.Path(__file__).resolve().parent
ctx=ssl.create_default_context();ctx.load_verify_locations(os.environ['CODEX_PROXY_CERT'])
checks=[];assets=[];routes=[]
def get(url):
 try:
  with urllib.request.urlopen(url,context=ctx,timeout=40) as r:return r.status,r.read(),r.url
 except urllib.error.HTTPError as e:return e.code,e.read(),e.url
def check(name,value):
 checks.append({'name':name,'pass':bool(value)})
 if not value:raise RuntimeError(name)
for name in ['providers.js','fleet.js','systems.js','measurement.js','enquiry.js','fleet-data.js']:
 status,body,url=get('https://worksbetter.ai/wp-content/themes/worksbetter-wpvibe-draft/assets/'+name)
 expected=(root/'source/theme/assets'/name).read_bytes();same=body==expected
 check(name+' actual public source hash',status==200 and same)
 assets.append({'asset':name,'status':status,'sha256':hashlib.sha256(body).hexdigest(),'source_sha256':hashlib.sha256(expected).hexdigest(),'exact':same})
article='/why-monthly-reporting-takes-two-days/'
for route in ['/',article,'/guides/','/inside-an-ai-agent-fleet/','/multi-source-report-automation/','/enquiry-privacy/']:
 status,body,url=get('https://worksbetter.ai'+route);check(route+' status200',status==200);soup=BeautifulSoup(body,'html.parser');routes.append({'route':route,'status':status,'title':soup.title.get_text() if soup.title else None,'canonical':soup.find('link',rel='canonical')['href'] if soup.find('link',rel='canonical') else None});check(route+' one H1',len(soup.find_all('h1'))==1);check(route+' canonical',routes[-1]['canonical']=='https://worksbetter.ai'+route);check(route+' no preview artifacts','wpvibe_preview' not in body.decode() and 'WPVibe Draft Preview' not in body.decode())
 if route==article:
  expected=next(x for x in json.loads((root/'source/content/posts.json').read_text()) if x['id']==46)
  check('46 title and H1 aligned',soup.h1.get_text()==expected['title'] and expected['title'] in soup.title.get_text());description=soup.find('meta',attrs={'name':'description'});check('46 search description',description and description.get('content')==expected['excerpt']);robots=soup.find('meta',attrs={'name':'robots'});check('46 indexable directive',robots and 'noindex' not in robots.get('content',''))
  check('46 reporting direct link',soup.find('a',href='/inside-an-ai-agent-fleet/#reporting') is not None)
  schemas=[json.loads(s.get_text()) for s in soup.find_all('script',type='application/ld+json')];check('46 structured data parses',len(schemas)>0);routes[-1]['structured_data']=schemas
  graph=[g for data in schemas for g in data.get('@graph',[data])]
  check('46 actual author Person attribution',any(g.get('@type')=='Person' and g.get('name')=='Renzo Demartini' for g in graph))
  check('46 actual article author attribution',any(g.get('@type')=='BlogPosting' and g.get('author',{}).get('name')=='Renzo Demartini' for g in graph))
  destinations=sorted({a['href'].split('#')[0] for a in soup.find_all('a',href=True) if a['href'].startswith('/')})
  for path in destinations:code,_,_=get('https://worksbetter.ai'+path);check('46 internal link '+path,code==200)
 if route=='/guides/':check('46 discovery in Guides',soup.find('a',href='https://worksbetter.ai'+article) is not None or soup.find('a',href=article) is not None)
for route in ['/automation-or-ai-which-job/','/systems-do-not-need-replacing/','/human-approval-is-a-feature/','/lead-routing-first-15-minutes/','/sometimes-do-not-automate-this/','/map-the-work-before-buying-another-tool/','/wb-acquisition-verification-missing-20261002/']:
 status,_,_=get('https://worksbetter.ai'+route);check(route+' genuine404',status==404);routes.append({'route':route,'status':status})
for route in ['/robots.txt','/sitemap_index.xml','/post-sitemap.xml','/page-sitemap.xml']:
 status,body,_=get('https://worksbetter.ai'+route);check(route+' status200',status==200)
 if route=='/robots.txt':check('robots references sitemap',b'sitemap' in body.lower())
 if route=='/post-sitemap.xml':check('new46 in post sitemap',('https://worksbetter.ai'+article).encode() in body);check('future52 excluded from public sitemap',b'/map-the-work-before-buying-another-tool/' not in body)
status,body,url=get('https://worksbetter.ai/why-are-we-entering-this-twice/');check('45 remains public',status==200);soup=BeautifulSoup(body,'html.parser');schemas=[json.loads(s.get_text()) for s in soup.find_all('script',type='application/ld+json')];graph=[g for data in schemas for g in data.get('@graph',[data])];check('45 public author attribution',any(g.get('@type')=='BlogPosting' and g.get('author',{}).get('name')=='Renzo Demartini' for g in graph))
status,body,url=get('https://worksbetter.ai/author/admin/');routes.append({'route':'/author/admin/','status':status,'final_url':url});check('existing author route resolves',status==200)
result={'as_of':'2026-10-02','scope':'Actual anonymous HTTPS content/assets/metadata/schema/internal links/sitemap/unpublished and missing routes. No enquiry submissions or analytics requests. Native parity recorded separately.','checks':checks,'assets':assets,'routes':routes}
(root/'docs/verification/acquisition-public-2026-10-02.json').write_text(json.dumps(result,indent=2)+'\n');print(json.dumps({'checks':len(checks),'failed':len([x for x in checks if not x['pass']]),'article_schema_types':[s.get('@type') for x in routes if x['route']==article for s in x.get('structured_data',[])]}))
