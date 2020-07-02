
const {ccclass, property} = cc._decorator;

@ccclass
export default class NewClass extends cc.Component {



    // LIFE-CYCLE CALLBACKS:

    onLoad () {
        this.node.on(cc.Node.EventType.TOUCH_END,()=>{
            this._startEdit()
        },this)
    }

    start () {

    }

    // update (dt) {}
}
