
const {ccclass, property} = cc._decorator;
import List from './CustomScroll_2'
@ccclass
export default class NewClass extends cc.Component {

    @property(List)
    list: List = null;
    @property(cc.Prefab)
    dropListPrefab : cc.Prefab = null

    data = []
    dropListData = []
    dropListNode : cc.Node = null
    onLoad () {
        this.dropListNode = cc.instantiate(this.dropListPrefab)
        for(var i = 0;i < 100 ;i++){
            this.data.push(i)
        }
        this.list.loadData(this.data,false)
        for(var i = 0; i < 5 ;i++ ){
            this.dropListData.push(i)
        }
        this.list.listen(this.displayDroplist.bind(this))
    }
    clickdelete(){
        this.list.deleteItem();
    }
    clickUpdate(){
        this.list.updateView();
    }
    clickAddData(){
        var data = ['a','b','c','d']
        this.list.addData(data,0)
    }
    clickClear(){
        this.list.clearData();
    }

    displayDroplist(node:any){
        let droplist = this.dropListNode.getComponent('CustomScroll_2')
        this.dropListNode.removeFromParent()
        if(node[0].name == 'label') node[0] = node[0].parent
        cc.log('node0 = '+node[0].name+'pick = '+this.list.returnPick()[0].name)
        if(this.list.returnPick()[0] == node[0]){
            cc.log('jinlaile')
            node.forEach(element => {
                this.dropListNode.width = 50
                this.dropListNode.height = 210
                droplist._freshItem()
                droplist.loadData(this.dropListData)
                element.addChild(this.dropListNode)
                this.dropListNode.setPosition(100,0)
            }); 
        }
    }
    // update (dt) {}
}
