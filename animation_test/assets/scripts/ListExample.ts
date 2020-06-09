
const {ccclass, property} = cc._decorator;
import List from './CustomScroll_2'
import {eventCenter} from './CustomScroll_2'
@ccclass
export default class NewClass extends cc.Component {

    @property(List)
    list: List = null;

    pick= []
    red = cc.Color.RED
    blue = cc.Color.BLUE;
    // LIFE-CYCLE CALLBACKS:
    data = []
    onLoad () {
        for(var i = 0;i < 10000 ;i++){
            this.data.push(i)
        }
        this.list.loadData(this.data,false)
        eventCenter.on('select',(node)=>{
            node.forEach(element => {
                var flag = true;
                for(var i = 0;i<this.pick.length;i++){
                    if(this.pick[i] == element) flag = false;
                }
                if(!flag){
                    element.color = this.blue;
                    this.pick.splice(element.index,1)
                    cc.log('unpick  '+element.name)
                }
                else{
                    element.color = this.red
                    this.pick.push(element)
                    cc.log('pick'+element.name)
                }
            });
            
        })
    }
    Clickdelete(){
        this.list.deleteItem(this.pick)
        this.pick = []
    }


    // update (dt) {}
}
