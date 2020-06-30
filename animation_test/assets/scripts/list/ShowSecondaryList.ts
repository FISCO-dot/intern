
const {ccclass, property,executionOrder} = cc._decorator;
import List from './CustomScroll_2'
import { eventCenter } from '../list/CustomScroll_2';
@ccclass
@executionOrder(-5000)
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
        eventCenter.on('pick'+this.list.node.name,(node)=>{
            this.onSizeChange(Number(node[0].name),false)
            this.displayDroplist(node)
        },this.list.node)
        eventCenter.on('unpick'+this.list.node.name,(node)=>{
            this.onSizeChange(Number(node[0].name),true)
            this.dropListNode.removeFromParent()
        },this.list.node)
    }

    displayDroplist(node:any){
        let droplist = this.dropListNode.getComponent('CustomScroll_2')
        this.dropListNode.addComponent(cc.BlockInputEvents)
        this.dropListNode.removeFromParent()
        if(node[0].name == 'label') node[0] = node[0].parent
        node.forEach(element => {
                this.dropListNode.width = 50
                this.dropListNode.height = 210
                droplist._freshItem()
                droplist.loadData(this.dropListData)
                element.addChild(this.dropListNode)
                this.dropListNode.setPosition(100,0)
        })
    }
    onSizeChange(index : number,transverse: boolean ,extent : number = 20){
        let item = this.list.getItemByIndex(index)
        if(!transverse){
            item.height += extent
            item.setSiblingIndex(1000)           
            for(var i = 0;this.list.getItemByIndex(i) != null;i++){
                if(i < index) this.list.getItemByIndex(i).y += extent/2
                else if(i > index) this.list.getItemByIndex(i).y -= extent/2                
            }
        }
        else{
            item.height -= extent
            this.list.updateView()
        }
    }


}
