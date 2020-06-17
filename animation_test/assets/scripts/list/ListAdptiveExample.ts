import List from './CustomScroll_2'
const {ccclass, property} = cc._decorator;

@ccclass
export default class NewClass extends cc.Component {

    @property(List)
    list:List = null
    // LIFE-CYCLE CALLBACKS:

    onLoad () {
        let data = ['1111','22222222222222222222','3','4444444444444444444444444444444444444444444444','1','2','3']

        this.list.loadData(data)
    }

    clickAdd(){
        this.list.itenumYAdd()
    }

    // update (dt) {}
}
