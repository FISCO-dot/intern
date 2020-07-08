
const {ccclass, property} = cc._decorator;

@ccclass
export default class Cursor extends cc.Component {

    t = 0
    update (dt) {
        this.t += dt
        if(1 - this.t < 0.4){
            if(this.node.opacity == 0) this.node.opacity = 255
            else this.node.opacity = 0
            this.t = 0
        }
        
    }
}
