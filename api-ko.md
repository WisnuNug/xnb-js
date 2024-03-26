xnb.js api
=============
**xnb.js**의 사용법 및 프로그래밍 인터페이스를 다룹니다.
## Unpacking
### unpackToXnbData( file : File/Buffer )
- ``file`` (File / Buffer) : 언팩할 xnb 파일
- Returns : Promise - 언팩한 XnbData를 반환합니다.

xnb 파일을 비동기적으로 읽은 뒤 헤더, 리더가 포함된 XnbData를 반환합니다.
```js
// browser usage
document.getElementById("fileInput").addEventlistener(function(){
	const file = this.files[0];
	XNB.unpackToXnbData( file ).then(e=>console.log(e)); // returns XnbData{ header:..., readers:..., content:...}
})
// node.js usage
fs.readFile("./Crobus.xnb").then(unpackToXnbData).then(e=>console.log(e)) // returns XnbData{ header:..., readers:..., content:...}
```
### unpackToContent( file : File/Buffer )
- ``file`` (File / Buffer) : 언팩할 xnb 파일
- Returns : Promise - 언팩한 XnbContent를 반환합니다.

xnb 파일을 비동기적으로 읽은 뒤 콘텐츠 데이터만 들어 있는 XnbContent를 반환합니다.
```js
// browser usage
document.getElementById("fileInput").addEventlistener(function(){
	const file = this.files[0];
	XNB.unpackToContent( file ).then(e=>console.log(e)); // returns XnbContent{ type:..., content:...}
})
// node.js usage
fs.readFile("./Crobus.xnb").then(unpackToContent).then(e=>console.log(e)) // returns XnbContent{ type:..., content:...}
```
### unpackToFiles( file : File/Buffer, config : Object )
- ``file`` (File / Buffer) : 언팩할 xnb 파일
- ``config`` (Object) : 컨피그 설정
	- ``yaml`` (Boolean) : 헤더 json 파일을 yaml 형식으로 변환합니다. XnbExtract와 호환됩니다. 
	- ``contentOnly`` (Boolean) : 헤더 데이터를 제외한 컨텐츠 파일만 반환합니다.
	- ``fileName`` (String) : 반환할 파일의 이름입니다.
- Returns : Promise - 언팩한 결과 파일 데이터가 있는 Blob 배열을 반환합니다.

xnb 파일을 비동기적으로 읽은 뒤 Blob 배열을 반환합니다. 텍스트 데이터는 json 형식으로 반환됩니다.
config 매개변수에서 ``yaml``과 ``contentOnly``가 전부 ``true``이면 ``contentOnly``를 우선합니다.
배열의 각 원소는 `{data, extension}`으로 구성된 Object입니다. data는 언팩된 파일의 실제 데이터로, Blob 오브젝트(브라우저 환경) 혹은 Uint8Array(node.js 환경)이며, extension은 언팩된 파일의 확장자입니다.
```js
// browser usage
document.getElementById("fileInput").addEventlistener(function(){
	const file = this.files[0];
	XNB.unpackToFiles( file ).then(e=>{
		for(let {data, extension} of e)
		{
			console.log(data); // returns Blob()
			console.log(extension); // returns "png", "json", etc...
		}
	});
})
// node.js usage
const fileName = "Crobus.xnb";
const baseName = path.basename(fileName, ".xnb");
fs.readFile(`./${fileName}`)
	.then( e=>XBM.unpackToFiles( file, { fileName:baseName }) )
	.then( e=>{
		for(let {data, extension} of e)
		{
			console.log(data); // returns UInt8Array()
			console.log(extension); // returns "png", "json", etc...
		}
	} );
```
### bufferToXnb( buffer : ArrayBuffer )
- ``buffer`` (ArrayBuffer) : xnb 파일의 바이너리 데이터
- Returns : XnbData

xnb 파일의 버퍼를 받아 헤더, 리더가 포함된 XnbData를 반환합니다.
### bufferToContents( buffer : ArrayBuffer )
- ``buffer`` (ArrayBuffer) : xnb 파일의 바이너리 데이터
- Returns : XnbContent

xnb 파일의 버퍼를 받아 콘텐츠 데이터만 들어 있는 XnbContent를 반환합니다.
### xnbDataToContent( loadedXnb : XnbData )
- ``loadedXnb`` (XnbData) : 헤더가 포함된 json 오브젝트
- Returns : XnbContent

XnbData를 XnbContent로 변환합니다.
### xnbDataToFiles( xnbObject : XnbData, config : Object )
- ``file`` (File / Buffer) : 언팩할 xnb 파일
- ``config`` (Object) : 컨피그 설정
	- ``yaml`` (Boolean) : 헤더 json 파일을 yaml 형식으로 변환합니다. XnbExtract와 호환됩니다. 
	- ``contentOnly`` (Boolean) : 헤더 데이터를 제외한 컨텐츠 파일만 반환합니다.
	- ``fileName`` (String) : 반환할 파일의 이름입니다.
- Returns : Array - 언팩한 결과 파일 데이터가 있는 Blob 배열을 반환합니다.

XnbData를 Blob 배열로 반환합니다. 형식은 unpackToFiles과 동일합니다.

## Packing

### pack( files : Flielist/Array, configs : Object )
- ``files`` (Filelist/Array) : xnb로 묶을 파일의 전체 리스트. json 파일 혹은 yaml 파일이 포함되어 있어야 합니다.
- ``configs`` (Object) : 컨피그 설정
	- ``compression`` (String) : 압축 방식입니다. 기본값은 ``"default"``입니다.
	- ``debug`` (Boolean) : `true`로 설정할 시, 모든 파일의 성공 및 실패 결과가 반환됩니다.
	
패킹할 파일들이 들어 있는 리스트를 받아, 각각의 파일들을 xnb 파일로 변환합니다. 헤더의 정보가 들어 있는 json 파일 혹은 yaml 파일(XnbExtract와 호환됨)이 포함되어 있어야 합니다.
xnb.js에서 현재 지원하는 압축 방식은 다음과 같습니다.
- `"default"` : 헤더에 명시된 압축 방식을 가급적 사용하도록 동작합니다. LZ4 압축 방식으로 명시된 파일은 LZ4 압축을 사용합니다. 현재 버전에는 LZX 압축 알고리즘이 구현되어 있지 않기 때문에, LZX 압축 방식으로 명시된 파일은 압축하지 않습니다.
- `"none"` : 압축하지 않은 결과를 반환합니다.
- `"LZ4"` : LZ4 압축 방식을 사용합니다. `"default"`에 비해 작은 파일 크기를 보장합니다. XnbExtract가 LZ4 압축 해제를 지원하지 않으므로, 이 설정을 사용하여 압축 해제된 파일은 XnbExtract에서 열 수 없습니다.(Stardew Valley에서는 열 수 있습니다.)

Pack 함수는 브라우저 환경에서는 `<input type="file">` 엘리먼트의 `files`를 바로 넣을 수 있으나, node.js 환경에서는 `FileList` 객체가 없으므로, 각 원소가 `{name, data}` 오브젝트인 배열을 매개변수로 넣어야 합니다. `name`은 파일의 이름을, `data`는 파일의 실제 바이너리 버퍼를 의미합니다.
node.js 환경에서 pack 함수를 사용하기 위해서는 다음의 예제를 참조하십시오.
```js
const files = await readdir(input);
const fileList = [];

// make fileList
for (let name of files)
{
	const readPath = path.resolve(input, name);
	const data = await readFile(readPath);
	fileList.push({name, data});
}

// pack to xnb data
const result = await pack(fileList);
console.log(result);
```

## Reader Plugins

### setReaders( readers : Object\<BaseReader\> )
- ``readers`` (Object\<BaseReader\>) : 커스텀 리더

xnb.js에서 사용하는 리더의 종류를 지정합니다. 특정한 Reader만 사용하고 싶을 때 유용합니다.
``readers``의 key는 xnb 파일의 헤더가 인식 가능한 자료명+Reader로, value는 BaseReader를 상속한 리더 클래스가 들어가야 합니다. 다음의 예제를 참조하십시오.
```js
import {setReaders} from "@xnb/core";
import {LightweightTexture2DReader, StringReader} from "@xnb/readers";

setReaders({
	Texture2DReader : LightweightTexture2DReader,
	StringReader : StringReader
});
```

### addReaders( readers : Object\<BaseReader\> )
- ``readers`` (Object\<BaseReader\>) : 커스텀 리더

xnb.js에서 사용하는 리더를 추가합니다. 플러그인을 추가하고 싶을 때 유용합니다. 다음의 예제를 참조하십시오.
```js
import {addReaders} from "xnb";
import * as StardewReader from "@xnb/stardew-valley";

addReaders({...StardewReader});
```

### setSchemes( schemes: Object\<XNBSchemeObject\> )
- ``schemes`` (Object\<XNBSchemeObject\>) : C# 클래스의 타입 정의 객체

xnb.js에서 사용하는 scheme의 종류를 지정합니다.
The key of ``schemes``의 key는 대응하는 C# 클래스의 풀네임으로, value는 해당 C# 클래스의 타입을 나타내는 객체가 들어가야 합니다. 다음의 예제를 참조하십시오.
```js
import {setSchemes} from "xnb";

// from StardewValley.GameData.BigCraftables.BigCraftableData C# file
const bigCraftableScheme = {
	Name: "String",
	DisplayName: "String",
	Description: "String",
	Price: "Int32",
	Fragility: "Int32",
	CanBePlacedOutdoors: "Boolean",
	CanBePlacedIndoors: "Boolean",
	IsLamp: "Boolean",
	$Texture: "String",
	SpriteIndex: "Int32",
	$ContextTags: ["String"],
	$CustomFields: {"String": "String"}
};

setSchemes({"StardewValley.GameData.BigCraftables.BigCraftableData": bigCraftableScheme});
```

### addSchemes( schemes: Object\<XNBSchemeObject\> )
- ``schemes`` (Object\<XNBSchemeObject\>) : C# 클래스의 타입 정의 객체

xnb.js에서 사용하는 scheme을 추가합니다. 다음의 예제를 참조하십시오.
```js
import {addSchemes} from "xnb";
import {schemes as StardewSchemes} from "@xnb/stardew-valley";

addSchemes(StardewSchemes);
```

### setEnums( enums: Array\<string\> )
- ``enums`` (Array\<string\>) : C# enum 자료형의 풀네임

xnb.js가 해석할 수 있는 enum을 지정합니다. `enums`는 `StardewValley.Season`과 같이 해당 enum의 C# 풀네임이 들어가야 합니다. 다음의 예제를 참조하십시오.
```js
import {setEnums} from "xnb";

setEnums(["StardewValley.Season"]);
```

### addEnums( enums: Array\<string\> )
- ``enums`` (Array\<string\>) : C# enum 자료형의 풀네임

xnb.js가 해석할 수 있는 enum을 추가합니다. 다음의 예제를 참조하십시오.
```js
import {addEnums} from "xnb";

addEnums(["StardewValley.Season"]);
```


## Data Structure
### XnbData
XnbData 객체는 Xnb 파일에서 추출된 헤더와 리더 정보, 컨텐츠가 포함된 오브젝트입니다. unpackToXnbData(), bufferToXnb()의 반환값입니다. 라이브러리를 worker로 활용해서 데이터를 언팩할 때, json 데이터를 XnbData 객체로 변환할 수 있습니다.
#### XnbData( header : Object, readers : Array, content : Object )
- `header` (Object) : xnb의 헤더
	- `target` (String) : xnb의 타겟. 'w', 'm', 'x', 'a', 'i' 중 하나여야 합니다.
	- `formatVersion` (Number) : xnb의 포맷 버전. 3,4,5 중 하나여야 합니다.
	- `hidef` (Boolean) : xnb가 구동될 XNA의 그래픽 프로필입니다. true면 HiDef를, false면 Reach를 의미합니다.
	- `compressed` (Boolean/Number) : xnb의 압축 여부를 의미합니다. 128(LZX 압축) 또는 64(LZ4 압축)으로 명시할 수 있습니다.
- `readers` (Array) : xnb의 리더 데이터
- `contents` (Object) : xnb의 실제 컨텐츠 데이터

새로운 `XnbData` 객체를 생성합니다.
#### XnbData.prototype.header
xnb의 헤더입니다.
#### XnbData.prototype.readers
xnb의 리더 데이터입니다.
#### XnbData.prototype.content
xnb의 컨텐츠 데이터입니다.
#### XnbData.prototype.target *readonly*
xnb의 타겟 플랫폼을 반환합니다.
#### XnbData.prototype.formatVersion *readonly*
xnb의 포맷 버전을 반환합니다.
#### XnbData.prototype.hidef *readonly*
xnb의 hiDef 모드 여부를 반환합니다.
#### XnbData.prototype.compressed *readonly*
xnb의 압축 여부를 반환합니다.
#### XnbData.prototype.contentType *readonly*
xnb의 컨텐츠 타입을 반환합니다. 컨텐츠 타입은 다음의 5개 중 하나가 될 수 있습니다.
| 컨텐츠 타입 | 설명 |
|--|--|
| Texture2D | 텍스처 데이터입니다. 게임의 스프라이트 등이 포함됩니다. |
| TBin | 맵 파일입니다. |
| Effect | 이펙트 데이터입니다. |
| BMFont | 폰트 데이터입니다. |
| JSON | 오브젝트 데이터입니다. 게임의 아이템 목록, 대사 등 데이터가 포함됩니다. |
#### XnbData.prototype.rawContent *readonly*
xnb의 실제 컨텐츠를 반환합니다. XnbData.prototype.content에 export가 포함되어 있으면(Texture2D, TBin, Effect, BMFont) 해당 컨텐츠의 바이너리를 반환하고, 그 외에는 json 데이터를 반환합니다. 
Texture2D 타입의 컨텐츠는 png 형식으로 압축되지 않은 색상 데이터가 반환됩니다.
#### XnbData.prototype.stringify()
오브젝트를 json 문자열로 변환합니다.

### XnbContent
`XnbContent` 객체는 Xnb 파일에서 추출된 컨텐츠만 포함된 오브젝트입니다. 
#### XnbContent.prototype.type
xnb의 컨텐츠 타입을 반환합니다.
#### XnbContent.prototype.content
xnb의 실제 컨텐츠 데이터를 `Blob`/`Uint8Array` 형식으로 반환합니다. 
Texture2D 타입의 컨텐츠는 png 형식으로 압축된 데이터가 반환됩니다. 브라우저 환경에서 Blob URL을 사용하여 이미지를 보여줄 때 쓸 수 있습니다.