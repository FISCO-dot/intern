
const {ccclass, property} = cc._decorator;
import List from './CustomScroll_2'
import {eventCenter} from './CustomScroll_2'
@ccclass
export default class NewClass extends cc.Component {

    @property(List)
    list: List = null;

    // LIFE-CYCLE CALLBACKS:
    data = []
    onLoad () {
        for(var i = 0;i < 10000 ;i++){
            this.data.push(i)
        }
        this.list.loadData(this.data,false)
        
    }
    Clickdelete(){
        this.list.deleteItem();
        
    }
    updateClick(){
        this.list.updateView();
    }


    // update (dt) {}
}
