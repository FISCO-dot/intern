
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
        cc.log('jinlaile')
        let droplist = this.dropListNode.getComponent('CustomScroll_2')
        if(this.list.returnPick()[0] != node[0]){
            node.forEach(element => {
                this.dropListNode.removeFromParent()
                this.dropListNode.width = 40
                this.dropListNode.height = 200
                droplist._freshItem()
                droplist.loadData(this.dropListData)
                element.addChild(this.dropListNode)
                cc.log('============'+droplist.content.height+'========'+droplist.content.width)
                this.dropListNode.setPosition(150,0)
                this.list.showDetail(Number(element.name),false)
            });
        }
        else{
            this.dropListNode.removeFromParent()
            this.list.showDetail(Number(node[0].name),true)
        }

    }
    // update (dt) {}
}
