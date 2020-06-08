
const {ccclass, property} = cc._decorator;
import List from './CustomScroll'
import {eventCenter} from './CustomScroll'
@ccclass
export default class NewClass extends cc.Component {

    @property(List)
    list: List = null;

    pick= []
    // LIFE-CYCLE CALLBACKS:
    data = []
    onLoad () {
        for(var i = 0;i < 10000 ;i++){
            this.data.push(i)
        }
        this.list.loadData(this.data,false)
        eventCenter.on('select',(node)=>{
            node.forEach(element => {
                element.color = cc.Color.RED
                this.pick.push(element)
                cc.log(node[0].name)
            });
            
        })
    }
    Clickdelete(){
        this.list.deleteItem(this.pick)
        this.pick = []
    }


    // update (dt) {}
}
