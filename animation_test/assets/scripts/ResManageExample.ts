import ResLoader from './ResManager'
import MyResLoader from './MyResManager'
const {ccclass,property} = cc._decorator;
@ccclass
export default class ResExample extends cc.Component {
    @property(cc.Node)
    attachNode: cc.Node = null;
    @property(cc.Label)
    dumpLabel: cc.Label = null;
    onLoad(){
        this.onOwnLoadRes();
        // this.node.parent.on('mousedown',(event)=>{
        //     this.onMyUnloadRes()
        // })
    }
    start(){
    }

    onLoadRes() {
        cc.loader.loadRes("Prefab/HelloWorld", cc.Prefab, (error: Error, prefab: cc.Prefab) => {
            if (!error) {
                cc.instantiate(prefab).parent = this.attachNode;
            }
        });
    }

    onUnloadRes() {
        this.attachNode.removeAllChildren(true);
        cc.log('jinlaile'+this.attachNode.children.length)

        cc.loader.releaseRes("Prefab/HelloWorld");
    }

    onMyLoadRes() {
        ResLoader.getInstance().loadRes("Prefab/HelloWorld", cc.Prefab, (error: Error, prefab: cc.Prefab) => {
            if (!error) {
                cc.instantiate(prefab).parent = this.attachNode;
            }
        });
    }

    onMyUnloadRes() {
        this.attachNode.removeAllChildren(true);
        ResLoader.getInstance().releaseRes("Prefab/HelloWorld");
        
    }

    onOwnLoadRes(){
        MyResLoader.getInstance().loadRes("Prefab/HelloWorld", cc.Prefab, (error: Error, prefab: cc.Prefab) => {
            if (!error) {
                cc.instantiate(prefab).parent = this.attachNode;
            }
        });
        
    }
    onOwnUnloadRes(){
        this.attachNode.removeAllChildren(true);
        ResLoader.getInstance().releaseRes("Prefab/HelloWorld");
    }
    onDump() {
        let Loader:any = cc.loader;
        this.dumpLabel.string = `当前资源总数:${Object.keys(Loader._cache).length}`;
    }
    update(dt){
        this.onDump();

    }
}