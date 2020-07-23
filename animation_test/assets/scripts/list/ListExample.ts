
const {ccclass, property,executionOrder} = cc._decorator;
import List from './CustomScroll_2'
import { eventCenter } from '../list/CustomScroll_2';
@ccclass
@executionOrder(-5000)
export default class NewClass extends cc.Component {

    @property(List)
    list: List = null;


    data = []
    dropListData = []
    dropListNode : cc.Node = null
    onLoad () {
        for(var i = 0;i < 10 ;i++){
            this.data.push(i)
        }
        this.list.setItemColor(cc.color(100,100,100,255))
        this.list.loadData(this.data,false)

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
}
