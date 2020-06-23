import List from './CustomScroll_2'
const {ccclass, property} = cc._decorator;

@ccclass
export default class NewClass extends cc.Component {

    @property(List)
    list:List = null
    @property(cc.EditBox)
    editbox : cc.EditBox = null;
    // LIFE-CYCLE CALLBACKS:

    onLoad () {
        let data = ['hello']
        this.editbox.node.on('editing-return', this.sendInputMessage, this);
        this.list.loadData(data)
    }


    clickDel(){
        this.list.deleteItem()
    }
    sendInputMessage(){
        if(this.editbox.string == '') return
        this.list.addData(this.editbox.string)
        this.editbox.string = ''
    }

    // update (dt) {}
}
