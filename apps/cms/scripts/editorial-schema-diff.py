"""Generate an additive SQLite/D1 migration from old and fresh target schemas.
Never drops tables, columns, records, or indexes. Run on private copies only.
"""
import sqlite3,sys,re
old,new,out=sys.argv[1:]
a,b=sqlite3.connect(old),sqlite3.connect(new)
def tables(c):return dict(c.execute("select name,sql from sqlite_master where type='table' and name not like 'sqlite_%' and name not like '_cf_%'"))
def columns(sql):
 body=sql[sql.index('(')+1:sql.rindex(')')];parts=[];start=0;depth=0;quote=None
 for i,ch in enumerate(body):
  if quote:
   if ch==quote:quote=None
  elif ch in "'\"`":quote=ch
  elif ch=='(':depth+=1
  elif ch==')':depth-=1
  elif ch==',' and depth==0:parts.append(body[start:i].strip());start=i+1
 parts.append(body[start:].strip());return parts
at,bt=tables(a),tables(b);statements=['-- Additive editorial integration schema. Review and apply once after backup.']
for name,sql in bt.items():
 if name not in at:statements.append(sql+';');continue
 oldcols={r[1] for r in a.execute('pragma table_info("'+name+'")')}
 for col in columns(sql):
  match=re.match(r'[`\"]?([\w]+)[`\"]?\s',col)
  if not match or match[1].upper() in ['FOREIGN','PRIMARY','UNIQUE','CHECK','CONSTRAINT']:continue
  if match[1] not in oldcols:statements.append(f'ALTER TABLE "{name}" ADD COLUMN {col};')
indexes={r[0] for r in a.execute("select name from sqlite_master where type='index'")}
for name,sql in b.execute("select name,sql from sqlite_master where type='index' and sql is not null"):
 if name not in indexes:statements.append(sql+';')
open(out,'w').write('\n\n'.join(statements)+'\n');print(f'{len(statements)-1} additive schema statements generated.')
