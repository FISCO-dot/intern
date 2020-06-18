import List from './CustomScroll_2'
const {ccclass, property} = cc._decorator;
var editboxEventHandler = new cc.Component.EventHandler();

@ccclass
export default class NewClass extends cc.Component {

    @property(List)
    list:List = null
    @property(cc.EditBox)
    editbox : cc.EditBox = null;
    // LIFE-CYCLE CALLBACKS:

    onLoad () {
        let data = ['hello','nothing to say ','blablabla ','oooooooooo']
        this.editbox.node.on('editing-return', this.sendInputMessage, this);
        this.editbox.node.on('editing-did-began', this.startInputMessage, this);
        this.list.loadData(data)
    }

    clickAdd(){
        this.list.itenumYAdd()
    }
    clickDel(){
        this.list.deleteItem()
    }
    input : string[] = []
    sendInputMessage(){
        this.input.push(this.editbox.textLabel.string)
        this.list.addData(this.input,100)
        this.editbox.textLabel.string = ''
        this.clickAdd()
    }
    startInputMessage(){
        this.editbox.textLabel.string = ''
        cc.log('jinlaile')
    }
    // update (dt) {}
}
