import 'phaser';
export default class Demo extends Phaser.Scene
{
    player: Phaser.Types.Physics.Arcade.SpriteWithDynamicBody;
    cursors: Phaser.Types.Input.Keyboard.CursorKeys;
    pipes:  Phaser.Physics.Arcade.Group;
    // rocks: Phaser.Physics.Arcade.StaticGroup;
    firstTimestamp: number;
    currentTimestamp: number;
    timestampLastRockAdded: number;
    timeToAddPipe: number;
    groundDirt1: Phaser.Types.Physics.Arcade.ImageWithDynamicBody;
    groundDirt2: Phaser.Types.Physics.Arcade.ImageWithDynamicBody;
    groundDirtDown1: Phaser.Types.Physics.Arcade.ImageWithDynamicBody;
    groundDirtDown2: Phaser.Types.Physics.Arcade.ImageWithDynamicBody;
    score: number;
    scoreText: Phaser.GameObjects.Text;
    gameOver = false;

    constructor ()
    {
        super('demo');
    }

    getCurrentTimestamp(): number 
    {
        return new Date().getTime();
    }

    preload ()
    {
        this.load.image('background', 'assets/background.png');
        this.load.image('planeBlue1', 'assets/planeBlue1.png');
        this.load.image('planeBlue2', 'assets/planeBlue2.png');
        this.load.image('planeBlue3', 'assets/planeBlue3.png');
        this.load.image('rock', 'assets/rock.png');
        this.load.image('pipe', 'assets/pipe.png');
        this.load.image('pipeDown', 'assets/pipeDown.png');
        this.load.image('groundDirt', 'assets/groundDirt.png');
        this.load.image('groundDirtDown', 'assets/groundDirtDown.png');

        this.cursors = this.input.keyboard.createCursorKeys();
    }

    create ()
    {
        this.scoreText =  this.add.text(16, 16, 'score: 0', { fontSize: '32px', color: '#000'});
        this.currentTimestamp = this.getCurrentTimestamp();
        this.firstTimestamp = this.currentTimestamp
        this.timestampLastRockAdded = this.currentTimestamp;
        this.timeToAddPipe = 2000;
        this.score = 0;

        this.add.image(400, 240, 'background');
        
        
        this.pipes = this.physics.add.group({
            allowGravity: false
        });

        this.pipes.create(820, 390, 'pipe');
        this.pipes.create(820, 0, 'pipeDown'); 
        this.pipes.setVelocityX(-150);

        this.anims.create({
            key: 'player',
            frames: [
                { key: 'planeBlue1' },
                { key: 'planeBlue2' },
                { key: 'planeBlue3' },
            ],
            frameRate: 10,
            repeat: -1
        });

        this.player = this.physics.add.sprite(50, 10, 'planeBlue1').play('player');
        

        this.groundDirt1 = this.physics.add.image(400, 445, 'groundDirt').setImmovable(true);
        this.groundDirt2 = this.physics.add.image(1200, 445, 'groundDirt').setImmovable(true);
        this.groundDirtDown1 = this.physics.add.image(400, 35, 'groundDirtDown').setImmovable(true);
        this.groundDirtDown2 = this.physics.add.image(1200, 35, 'groundDirtDown').setImmovable(true);

        this.groundDirt1.body.setAllowGravity(false);
        this.groundDirt2.body.setAllowGravity(false);
        this.groundDirtDown1.body.setAllowGravity(false);
        this.groundDirtDown2.body.setAllowGravity(false);

        this.groundDirt1.setVelocityX(-150);
        this.groundDirt2.setVelocityX(-150);
        this.groundDirtDown1.setVelocityX(-150);
        this.groundDirtDown2.setVelocityX(-150);
        
        this.groundDirt1.setDepth(10);
        this.groundDirt2.setDepth(10);
        this.groundDirtDown1.setDepth(10);
        this.groundDirtDown2.setDepth(10);
        this.scoreText.setDepth(11);

        this.physics.add.collider(this.player, this.pipes, this.endGame, null, this);
        this.physics.add.collider(this.player, this.groundDirt1, this.endGame, null, this);
        this.physics.add.collider(this.player, this.groundDirt2, this.endGame, null, this);
        this.physics.add.collider(this.player, this.groundDirtDown1, this.endGame, null, this);
        this.physics.add.collider(this.player, this.groundDirtDown2, this.endGame, null, this);
    }

    endGame(player, object)
    {
        this.physics.pause();
        this.player.setTint(0xff0000);
        this.player.stop();
        this.gameOver = true;
    }

    update () 
    { 
        if (this.gameOver == true) {
            this.scoreText.setText('Score: ' + this.score + '. Press Space to restart');

            if (this.cursors.space.isDown) {
                this.gameOver = false;
                this.scene.restart();
            }

            return;
        }

        if (this.groundDirt1.getBottomRight().x < 0) {
            this.groundDirt1.setPosition(this.groundDirt2.getBottomRight().x + 400, 445);
        }

        if (this.groundDirt2.getBottomRight().x < 0) {
            this.groundDirt2.setPosition(this.groundDirt1.getBottomRight().x + 400, 445);
        }

        if (this.groundDirtDown1.getBottomRight().x < 0) {
            this.groundDirtDown1.setPosition(this.groundDirtDown2.getBottomRight().x + 400, 35);
        }

        if (this.groundDirtDown2.getBottomRight().x < 0) {
            this.groundDirtDown2.setPosition(this.groundDirtDown1.getBottomRight().x + 400, 35);
        }

        if (this.cursors.space.isDown) {
            this.player.setVelocityY(-100);
        }

        this.currentTimestamp = this.getCurrentTimestamp();

        this.score = Math.floor((this.currentTimestamp - this.firstTimestamp) / 1000);
        this.scoreText.setText('Score: ' + this.score);

        if (this.currentTimestamp >= this.timestampLastRockAdded + this.timeToAddPipe) {
            this.addRock();
        }
    }

    addRock() 
    {
        const whichPipe = Phaser.Math.Between(0, 1) === 1
            ? { x: 840, y: 0, name: 'pipeDown'}
            : { x: 840, y: 390, name: 'pipe'}
        ;

        this.pipes.create(whichPipe.x, whichPipe.y, whichPipe.name);
        this.pipes.setVelocityX(-150);
        this.timestampLastRockAdded = this.getCurrentTimestamp();
        this.timeToAddPipe = Phaser.Math.Between(1000, 3000);
    }

}

const config = {
    type: Phaser.AUTO,
    backgroundColor: '#125555',
    width: 800,
    height: 480,
    scene: Demo,
    physics: {
        default: 'arcade',
        arcade: {
            gravity: { y: 300 },
            debug: false,
        }
    }
};

const game = new Phaser.Game(config);

// export NODE_OPTIONS=--openssl-legacy-provider
