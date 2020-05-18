import customAnimationComponent from './animation_component'
const {ccclass, property} = cc._decorator;

@ccclass
export default class NewClass extends cc.Component {
    @property(customAnimationComponent)
    customAnimationComponent:customAnimationComponent = null;
    @property(cc.SpriteAtlas)
    spriteAtlas : cc.SpriteAtlas = null;


    onLoad () {
        this.customAnimationComponent.addClip(this.spriteAtlas);
        console.log('add after '+this.customAnimationComponent.anim.getClips().length)
        var clip = this.node.getComponent(cc.Animation).getClips()[1];
        console.log('clip '+ clip.duration)
        // this.node.getComponent(cc.Animation).play('1')
        this.customAnimationComponent.removeClip(clip,true);
        console.log('remove after '+this.customAnimationComponent.anim.getClips().length)
        console.log('effect after '+this.customAnimationComponent.effects.length)


    }

}
