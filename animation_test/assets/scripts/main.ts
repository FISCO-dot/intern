const {ccclass, property} = cc._decorator;

@ccclass
export default class NewClass extends cc.Component {

    onLoad () {
        
        
    }

    start(){
        var main = this.node.getComponent('AnimationComponent')
        console.log('main'+ main.loopTime)
        main.play(1,1,0);
        main.stopAnim(1,4)
    }

    // update (dt) {}
}
