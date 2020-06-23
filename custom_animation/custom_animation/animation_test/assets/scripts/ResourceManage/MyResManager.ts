// 资源加载的处理回调
type ProcessCallback = (completedCount: number, totalCount: number, item: any) => void;
// 资源加载的完成回调
type CompletedCallback = (error: Error, resource: any) => void;
interface LoadResArgs{
    url:string,
    type?:typeof cc.Asset,
    onCompleteCallback?:CompletedCallback,
    onProgressCallback?:ProcessCallback,

}
interface CacheInfo {
    using: Set<string>,    //用了谁
    used: Set<string>      //被谁用
}
export default class ResLoader{
    private  _uuidTree : Map<string,CacheInfo> = new Map<string,CacheInfo>();
    private static _resLoader: ResLoader = null;
    public static getInstance(): ResLoader {      //实例化
        if (!this._resLoader) {
            this._resLoader = new ResLoader();
        }
        return this._resLoader;
    }

    public static destroy(): void {
        if (this._resLoader) {
            this._resLoader = null;
        }
    }

    private constructor() {

    }
    private _makeResArgs(): LoadResArgs {
        if(arguments.length < 1 || typeof arguments[0] != 'string') console.log('argument error')
        let ret : LoadResArgs = {url:arguments[0]}
        for(let i = 1;i < arguments.length;i++){
            if(cc.js.isChildClassOf (arguments[i],cc.RawAsset) ) ret.type = arguments[i]
            else if(typeof arguments[i] == 'function'){
                if(i < arguments.length-1  ) ret.onProgressCallback = arguments[i]
                else ret.onCompleteCallback = arguments[i]
            }

        }
        return ret
    }
    private _setDependent(itemUuid:string){
        if(this._uuidTree.has(itemUuid) == false) {this._uuidTree.set(itemUuid,{using:new Set(),used:new Set()})}
        let itemDep = cc.loader.getDependsRecursively(itemUuid)
        if(itemDep.length == 0 ||(itemDep.length == 1 && itemDep[0] == itemUuid)) {return}    //没有依赖或者以来自己就返回
        for(let i = 0;i < itemDep.length;i++){
            this._uuidTree.get(itemUuid).using.add(itemDep[i])           //using添加
            if(this._uuidTree.has(itemDep[i]) == false) this._uuidTree.set(itemDep[i],{using:new Set(),used:new Set()})
            this._uuidTree.get(itemDep[i]).used.add(itemUuid)               //used添加
            if(itemUuid != itemDep[i]) this._setDependent(itemDep[i])       //如果不是自己就递归
        }
        
    }
    private _getReleaseList(uuid:string,list:Set<string>){
        if(this._uuidTree.has(uuid) == false) return
        let used = this._uuidTree.get(uuid).used
        if(used.size == 0 || (used.size == 1 && used.has(uuid)))  {
            list.add(uuid)
            this._uuidTree.get(uuid).used.delete(uuid)
            this._uuidTree.get(uuid).using.delete(uuid)  //删除自己的using和used，这样using里面没有自己不会死循环
            let using = this._uuidTree.get(uuid).using  
            using.forEach(element => {
                this._uuidTree.get(element).used.delete(uuid);  //删除指定资源所使用的资源的used列表，并将所使用的资源再次进入是否释放的判断
                this._getReleaseList(element,list)
            })
            this._uuidTree.delete(uuid)
        }
        else {return}

    }
        /**
     * 开始加载资源
     * @param url           资源url
     * @param type          资源类型，默认为null
     * @param onProgess     加载进度回调
     * @param onCompleted   加载完成回调
     */
    public loadRes(url:string,type?:typeof cc.Asset)
    public loadRes(url:string,onCompleteCallback:CompletedCallback)
    public loadRes(url:string,onProgressCallback:ProcessCallback,onCompleteCallback:CompletedCallback)
    public loadRes(url:string,type:typeof cc.Asset,onCompleteCallback:CompletedCallback)
    public loadRes(url:string,type:typeof cc.Asset,onProgressCallback:ProcessCallback,onCompleteCallback:CompletedCallback)
    public loadRes(){
        
        let resArgs :LoadResArgs = this._makeResArgs.apply(this,arguments)
        console.time("loadRes|"+resArgs.url);
        let finishCallback = (error:Error,resource:any)=>{
            let ccloader: any = cc.loader;
            let itemUuid = ccloader._getResUuid(resArgs.url, resArgs.type, false)
            this._setDependent(itemUuid)

            if (resArgs.onCompleteCallback) {
                resArgs.onCompleteCallback(error, resource);               
            }
            console.timeEnd("loadRes|"+resArgs.url);
            // console.log(`before delete ${this._uuidTree.size}`)
        }
        let res = cc.loader.getRes(resArgs.url, resArgs.type);
        if (res) {
            finishCallback(null, res);
        } else {
            cc.loader.loadRes(resArgs.url, resArgs.type, resArgs.onProgressCallback, finishCallback);
        }
        
    }
        /**
     * 释放资源
     * @param url           资源url
     * @param type          资源类型，默认为null
     */
    public releaseRes(url:string,type?:typeof cc.Asset)
    public releaseRes(){
        let resArgs :LoadResArgs = this._makeResArgs.apply(this,arguments)
        // console.time("releaseRes|"+resArgs.url);
        let ccloader: any = cc.loader;
        let itemUuid = ccloader._getResUuid(resArgs.url, resArgs.type, false)
        if (!itemUuid || itemUuid.length == 0) {
            console.warn(`releaseRes item is null ${resArgs.url} ${resArgs.type}`);
            return;
        }
        let releaseList : Set<string> = new Set()
        this._getReleaseList(itemUuid,releaseList)
        if(releaseList.size == 0) console.log('this res cannot be released')
        else{
            releaseList.forEach(element => {
                cc.loader.release(element)
                cc.log("resoure ID :" +element + "has released")
            })
        }
        // console.log(`After delete ${this._uuidTree.size}`)
    }

    /**
     * 获取资源缓存信息
     * @param url 要获取的资源url
     */
    public getCacheInfo(url: string): CacheInfo {
        let ccloader: any = cc.loader;
        let itemUuid = ccloader._getResUuid(url, false)
        if (!this._uuidTree.has(itemUuid)) {
            cc.log('your request donnot exist')
            return
        }
        else{
            let using = this._uuidTree.get(itemUuid).using;
            using.forEach(element => {
                cc.log(`${itemUuid} +  is using  + ${element}`)
            });
            let used = this._uuidTree.get(itemUuid).used;
            used.forEach(element => {
                cc.log(itemUuid + ' is used by ' + element)
            });
            return 
        }
        
    }



}