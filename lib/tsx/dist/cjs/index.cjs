"use strict";var y=require("path"),g=require("fs"),x=require("module"),i=require("get-tsconfig"),n=require("../source-map-13827956.cjs"),T=require("../index-d696346e.cjs"),E=require("../resolve-ts-path-43f50656.cjs");require("source-map-support"),require("url"),require("esbuild"),require("crypto"),require("os");function u(s){return s&&typeof s=="object"&&"default"in s?s:{default:s}}var f=u(y),O=u(g),l=u(x);const P=/^\.{1,2}\//,M=/\.[cm]?tsx?$/,b=`${f.default.sep}node_modules${f.default.sep}`,d=process.env.ESBK_TSCONFIG_PATH?{path:f.default.resolve(process.env.ESBK_TSCONFIG_PATH),config:i.parseTsconfig(process.env.ESBK_TSCONFIG_PATH)}:i.getTsconfig(),h=d&&i.createFilesMatcher(d),F=d&&i.createPathsMatcher(d),N=n.installSourceMapSupport(),q=n.compareNodeVersion([13,2,0])>=0||n.compareNodeVersion([12,20,0])>=0&&n.compareNodeVersion([13,0,0])<0,m=l.default._extensions,A=m[".js"],R=[".js",".cjs",".cts",".mjs",".mts",".ts",".tsx",".jsx"],S=(s,e)=>{if(!R.some(o=>e.endsWith(o)))return A(s,e);process.send&&process.send({type:"dependency",path:e});let r=O.default.readFileSync(e,"utf8");if(e.endsWith(".cjs")&&q){const o=T.transformDynamicImport(e,r);o&&(r=N(o,e))}else{const o=T.transformSync(r,e,{tsconfigRaw:h==null?void 0:h(e)});r=N(o,e)}s._compile(r,e)};[".js",".ts",".tsx",".jsx"].forEach(s=>{m[s]=S}),Object.defineProperty(m,".mjs",{value:S,enumerable:!1});const D=n.compareNodeVersion([16,0,0])>=0||n.compareNodeVersion([14,18,0])>=0,p=l.default._resolveFilename.bind(l.default);l.default._resolveFilename=(s,e,t,r)=>{var o;if(!D&&s.startsWith("node:")&&(s=s.slice(5)),F&&!P.test(s)&&!((o=e==null?void 0:e.filename)!=null&&o.includes(b))){const a=F(s);for(const v of a){const _=j(v,e,t,r);if(_)return _;try{return p(v,e,t,r)}catch{}}}const c=j(s,e,t,r);return c||p(s,e,t,r)};const j=(s,e,t,r)=>{const o=E.resolveTsPath(s);if(e!=null&&e.filename&&M.test(e.filename)&&o)try{return p(o[0],e,t,r)}catch(c){const{code:a}=c;if(a!=="MODULE_NOT_FOUND"&&a!=="ERR_PACKAGE_PATH_NOT_EXPORTED")throw c}};