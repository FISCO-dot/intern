const {ccclass, property} = cc._decorator;

@ccclass
export default class NewClass extends cc.Component {

    onLoad () {
        
        
    }

    start(){
        var main = this.node.getComponent('AnimationComponent')
        main.play(1,1);
        main.playAdditive(0,0)
        // main.stop(1,4)
    }

    // update (dt) {}
}
