xnb.js 
=============
**xnb.js**는 웹 혹은 node.js 환경에서 xnb 파일을 다룰 수 있게 하는 자바스크립트 라이브러리입니다.

## xnb.js란?
xnb 포맷은 Microsoft XNA Game Studio에서 사용하는 압축된 데이터 포맷으로, Stardew Valley 등 게임에서 쓰이는 것으로 유명합니다. xnb.js는 xnb 파일을 별다른 프로그램을 설치하지 않아도 웹상에서 다룰 수 있게 할 수 있으며, 이를 통해 xnb 파일을 이용한 게임의 유틸리티 사이트나 프로그램 등을 쉽게 제작할 수 있습니다.
현재 완벽한 xnb의 압축 해제가 구현되었으며, lzx 압축 알고리즘을 구현한 오픈소스 자바스크립트 라이브러리의 부재로 인해 패킹 시에는 비압축되거나 lz4 압축 알고리즘으로 압축된 xnb 파일이 반환됩니다.

xnb.js는 LeonBlade의 [XnbCli](https://github.com/LeonBlade/xnbcli)를 기반으로, node.js 전용의 require, Buffer 등의 코드를 브라우저와 node.js 전부에 동작하도록 재작성된 라이브러리입니다. 모든 영광을 [LeonBlade](https://github.com/LeonBlade/)에게 바칩니다.

## 데모
웹 XNB 프리뷰어 : https://lybell-art.github.io/xnb-js

## 설치 방법
xnb.js 라이브러리는 npm으로 설치할 수 있으며, 자체 웹 서버에 파일을 업로드하거나 기존 cdn을 사용하여 빌드 시스템 없이 사용할 수 있습니다.
xnb.js는 es6 모듈을 이용하여 불러오는 것을 권장합니다.

### cdn
온라인에 호스팅된 라이브러리를 불러와서 사용할 수 있습니다. 사용 방법은 다음과 같습니다.

#### ES6 모듈로 불러오기(권장)
```js
import * as XNB from "https://cdn.jsdelivr.net/npm/xnb@1.0.2/dist/xnb.module.js";
```
#### 스크립트 링크로 불러오기
```html
<script src="https://cdn.jsdelivr.net/npm/xnb@1.0.2/dist/xnb.min.js"></script>
```
자신이 IE11 등 ES5를 지원해야 한다면, xnb.es5.min.js를 사용하는 것을 권장합니다.

### npm
```sh
npm install xnb
```
디폴트 export가 존재하지 않습니다. 다음과 같이 사용하십시오.
```js
import * as XNB from 'xnb';
```

## 사용 예제

### 브라우저 예시
xnb 파일을 불러와서 결과를 이미지로 보여줍니다.
```js
import { unpackToContent } from "xnb";
let previewUrl="";
const outputImageCanvas = document.getElementById("output");

document.getElementById("input").addEventListener("change", 
function handleFiles()
{
	if(!this.files || this.files.length === 0) return;
	// read file
	const file=this.files[0];

	// unpack xnb file as contents
	unpackToContent(file).then(function(content){
		// check content's type, and make blob url
		if(content.type === "png")
		{
			window.URL.revokeObjectURL(previewUrl);
			previewUrl = window.URL.createObjectURL(content.content);
			outputImageCanvas.src = previewUrl;
		}
	});
});
```
### node.js 예시
xnb 파일을 불러와서 언팩한 결과를 파일로 저장합니다.
```js
import { unpackToFiles } from "xnb";
import { readFile } from 'node:fs/promises';

readFile("./Abigail.xnb") // read xnb file as Buffer
.then(xnb=>unpackToFiles(xnb, {fileName:"Abigail.xnb"})) // unpack xnb file
.then(outputs=>{
	// save data to outputs folder
	const writers = [];
	for(let {data, extension} of outputs)
	{
		const writePath = path.resolve("./outputs", `Abigail.${extension}`);
		writers.push(writeFile(writePath, data));
	}
	return Promise.all(writers);
});
```
## API
이 링크를 참조하십시오.

## 외부 리소스
xnb.js에는 dxt.js와 lz4.js, png.js가 번들링되어 있으며, dxt.js와 lz4.js는 es6 모듈에 최적화되어 재작성되었습니다.
원본 코드의 라이선스는 다음과 같습니다.
| 이름 | 소스 코드 | 라이선스 |
|--|--|--|
| **dxt.js(Libsquish)** | https://sourceforge.net/projects/libsquish/ | MIT 라이선스 |
| **LZ4-js** | https://github.com/pierrec/node-lz4 | MIT 라이선스 |
| **png.js** | https://github.com/lukeapage/pngjs | MIT 라이선스 |

## 라이선스
GNU LGPL 3.0

## Other language
- [English](https://github.com/lybell-art/xnb-js/readme.md)