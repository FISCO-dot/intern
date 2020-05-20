const {ccclass, property} = cc._decorator;

@ccclass
export default class NewClass extends cc.Component {

    onLoad () {
        
        
    }

    start(){
        var main = this.node.getComponent('AnimationComponent')
        console.log('main'+ main.loopTime)
        main.play(1,0);
        main.playAdditive(0,0)
        cc.log('loop'+main.loopFrom)
        main.stop(1,4)
    }

    // update (dt) {}
}
