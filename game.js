const gameDuration = 30.0;
const CanvasWidth = 800;
const CanvasHeigth = 450;
const canvas = document.getElementById("myCanvas");
const ctx = canvas.getContext("2d");
let tickNumber = 1;
canvas.onmousedown = onmousedown;
canvas.onmousemove = onmousemove;

function loadImg(name) {
    const img = new Image();
    img.src = "img/" + name + ".png";
    return img;
}
function Square(x) {
    return x * x;
}
function getRandomInt(min, max) {
    return Math.floor(min + Math.random() * (max - min));
}


const tileSet1 = loadImg("0x72_DungeonTilesetII_v1.7x2");
const tileSet2 = loadImg("Shikashi");
const hotHealIcon = loadImg("3")
const fastHealIcon = loadImg("5")
const slowHealIcon = loadImg("8")
const shieldHealIcon = loadImg("48")
const aoeHealIcon = loadImg("58")
const enragedIcon = loadImg("106")

class Sprite {
    constructor(tile, tx, ty, tWidth, tHeight, nbImage) {
        this.tile = tile;
        this.tx = tx;
        this.ty = ty;
        this.tWidth = tWidth;
        this.tHeight = tHeight;
        this.singleWidth = tWidth / nbImage;
        this.correctAngus = 0;
    }
    paint(x, y, frame, reverse) {
        if (typeof (frame) === "undefined")
            frame = 0
        if (reverse) {
            ctx.save();
            ctx.translate(x + this.singleWidth, y);
            ctx.scale(-1, 1);

            ctx.drawImage(this.tile,
                this.tx + frame * this.singleWidth, this.ty,
                this.singleWidth - 1, this.tHeight,
                0, 0,
                (this.singleWidth - 1), this.tHeight
            )
            ctx.restore();
        } else {

            ctx.drawImage(this.tile,
                this.tx + frame * this.singleWidth, this.ty,
                this.singleWidth - 1, this.tHeight,
                x, y,
                (this.singleWidth - 1), this.tHeight
            )
        }
    }
    paintRotate(x, y, angus) {
        ctx.save();
        ctx.translate(x + this.singleWidth / 2, y + this.tHeight / 2);
        ctx.rotate(angus + this.correctAngus);
        ctx.drawImage(this.tile,
            this.tx, this.ty, this.singleWidth - 1, this.tHeight,
            -this.singleWidth / 2, -this.tHeight / 2, (this.singleWidth - 1), this.tHeight);
        ctx.restore();
    }
    paintScale(x, y, width, heigth)
    {
        ctx.drawImage(this.tile,
            this.tx + frame * this.singleWidth, this.ty,
            this.singleWidth - 1, this.tHeight,
            x, y, width, heigth);        
    }
}

const healerSprite = new Sprite(tileSet1, 256, 340, 288, 48, 9);
const witchSprite = new Sprite(tileSet1, 256, 274, 288, 48, 9);
const redKnightSprite = new Sprite(tileSet1, 256, 148, 256, 48, 8);
const elfSprite = new Sprite(tileSet1, 256, 84, 256, 44, 8);
const bigZombySprite = new Sprite(tileSet1, 40, 668, 492, 68, 8);
const arrowSprite = new Sprite(tileSet1, 644, 400, 20, 48, 1);
const frostSprite = new Sprite(tileSet2, 352, 672, 32, 32, 1);
const swordSprite = new Sprite(tileSet1, 640, 16, 28, 48, 1);
const hamerSprite = new Sprite(tileSet1, 640, 76, 28, 48, 1);
const enragedSprite = new Sprite(tileSet2, 32, 0, 32, 32, 1);
const deadSprite = new Sprite(tileSet2, 0, 0, 32, 32, 1);
enragedSprite.correctAngus = - 3 * Math.PI / 4;

class Character {
    constructor(name, sprite) {
        this.name = name;
        this.sprite = sprite;
        this.x = 400;
        this.y = 200;
        this.isVilain = false;
        this.width = sprite.singleWidth;
        this.height = sprite.tHeight;
        this.maxLife = 1000;
        this.life = 800;
        this.isTank = false;
        this.target = null;
        this.reverse = false;
        this.spells = [];
        this.buffs = [];
        this.onUpdate = null;
    }

    paint() {
        let spriteNumber = Math.floor(tickNumber / 8) % 2;
        if(this.life <= 0){
            spriteNumber = 0;
        }
        this.sprite.paint(this.x, this.y, spriteNumber, this.reverse);       
        if(this.life <= 0){
            deadSprite.paint(this.x + 10, this.y + 10);
        }
    }
    update() {
        if (this.life <= 0)
            return;
        for (let spell of this.spells) {
            spell.update(this);
        }
        for(let i = this.buffs.length - 1; i >= 0; i--){
            if(this.buffs[i].update()){
                this.buffs.splice(i, 1);
            }
        }
        if( this.onUpdate){
            this.onUpdate(this);
        }
    }
    onHit(projectileStat) {
        this.life = Math.max(0, this.life - projectileStat.dmg);
    }
    onHeal(power){
        if(this.life <= 0)
        {
            return;
        }
        this.life = Math.min(this.maxLife, this.life + power);
    }
    pushBuff(buff){
        for(let i = this.buffs.length - 1; i >= 0; i--){
            if(this.buffs[i].name == buff.name){
                this.buffs.splice(i, 1);
            }
        }
        this.buffs.push(buff);
    }
}
class CharacterMenu {
    constructor(character, i) {
        this.character = character;
        this.isLeft = !this.character.isVilain;
        this.x = this.isLeft ? 10 : 530;
        this.y = 20 + i * 60;
        this.height = 60;
        this.width = 200 + 40;
    }
    paint() {
        if (this.isLeft) {
            this.character.sprite.paint(this.x, this.y, 0);
            this.paintLifeBar(this.x + 40, this.y);
        } else {
            this.character.sprite.paint(this.x + this.width - 40, this.y, 0, true);
            this.paintLifeBar(this.x, this.y);
        }
        for(let i = 0; i <  this.character.buffs.length; i++){
            const offsetX = this.isLeft ? 40 : 0
            ctx.drawImage( this.character.buffs[i].icon, this.x + offsetX + i * 22, this.y + 32, 20, 20)
        }
    }

    paintLifeBar(left, top) {
        ctx.beginPath();
        ctx.lineWidth = "1";
        ctx.fillStyle = this.character.isVilain ? "FireBrick" : "green";
        ctx.rect(left, top + 10, this.character.life * 200 / this.character.maxLife, 20);
        ctx.fill();

        ctx.fillStyle = "black";
        ctx.font = "12px Arial";
        let label = "" + this.character.life + " / " + this.character.maxLife
        ctx.fillText(label, left + 80, top + 24);

        ctx.beginPath();
        ctx.lineWidth = "1";
        ctx.strokeStyle = "gray";
        ctx.rect(left, top + 10, 200, 20);
        ctx.stroke();
    }
}

class PnjSpell {
    constructor(stat, castFunc) {
        this.stat = stat;
        this.cooldown = stat.cooldown;
        this.tick = 0;
        this.castFunc = castFunc;
    }
    update(pnj) {
        this.tick = (this.tick + 1) % this.cooldown;
        if (this.tick == 0) {
            this.castFunc(this.stat, pnj);
        }
    }
}
class ProjectileStat {
    constructor(icon, dmg, cooldown, speed) {
        this.icon = icon;
        this.dmg = dmg;
        this.cooldown = cooldown;
        this.speed = speed;       
    }
}
let allAnimations = [];

class ProjectileAnim {
    constructor(stat, from, to) {
        this.stat = stat;
        this.from = from;
        this.to = to;
        this.x = from.x + from.width / 2;
        this.y = from.y + (from.height - stat.icon.tHeight) / 2;
        this.destX = to.x + to.width / 2;
        this.destY = to.y + (to.height - stat.icon.tHeight) / 2;
        this.targetAngus = Math.atan2(this.destY - this.y, this.destX - this.x);
    }
    update() {
        const d = Math.sqrt(Square(this.destX - this.x) + Square(this.destY - this.y));
        if (d < this.stat.speed) {
            this.to.onHit(this.stat);
            return true;
        }
        this.x += (this.destX - this.x) * this.stat.speed / d;
        this.y += (this.destY - this.y) * this.stat.speed / d;
        return false;
    }
    paint() {
        // this.stat.icon.paintRotate(this.x, this.y, 0);
        this.stat.icon.paintRotate(this.x, this.y, this.targetAngus + Math.PI / 2);
        //this.stat.icon.paintRotate(this.x, this.y, this.targetAngus-Math.PI / 2);
    }
}

class Heroes {
  createPelin(){
    const c = new Character("Pelin", healerSprite);
    c.maxLife = c.life = 800;
    const banana = new Sprite(tileSet2, 32, 450, 32, 32, 1);
    c.spells.push(new PnjSpell(new ProjectileStat(banana, 15, 45, 10), castSimpleProjectile));
    return c;
  }
  createKnight(){
    const c = new Character("Knight", redKnightSprite);
    c.maxLife = c.life = 1600;
    c.isTank = true;
    c.spells.push(new PnjSpell(new ProjectileStat(swordSprite, 30, 38, 7), castSimpleProjectile));
    return c;
  }
  createWitch(){
    const c = new Character("Witch", witchSprite);
    c.maxLife = c.life = 600;
    c.spells.push(new PnjSpell(new ProjectileStat(frostSprite, 40, 44, 12), castSimpleProjectile));
    return c;
  }
  createHunter(){
    const c = new Character("Hunter", elfSprite);
    c.maxLife = c.life = 800;
    c.spells.push(new PnjSpell(new ProjectileStat(arrowSprite, 50, 38, 10), castSimpleProjectile));
    return c;
  }
}
const heroesFactory = new Heroes();

class UpgradeFactory {

    propose3Upgrades(){
        let all = [];
        this.addPnjs(all);
        return all;
    }
    click(upgrade){
        upgrade.click();
    }    
    proposePnj(pnj, desc){        
        return {
            sprite : pnj.sprite,
            desc: desc,
            click: () => {
                teams.push(pnj);
            }
        };
    }    
    addPnjs(array){
        array.push(this.addKnight());
        array.push(this.addWitch());
        array.push(this.addHunter());
    }
    addKnight(){
        const c = heroesFactory.createKnight();
        return this.proposePnj(c, ["The knight can reduce","the damage with his shield"]);     
    }
    addWitch(){
        const c = heroesFactory.createWitch();
        return this.proposePnj(c, ["The witch can slow", "the attack of the ennemy"]);
    }
    addHunter(){
        const c = heroesFactory.createHunter();
        return this.proposePnj(c, ["The hunter deals", " regular damages"]);
    }
   
}
let upgradeFactory = new UpgradeFactory();
class Vilains {
    createVilainOfLevel(level){
        switch(level)
        {
             case 20: return this.lvl1();
            default: return this.lvl1();
        }
    }

    lvl1(){
        const sprite = new Sprite(tileSet1, 736, 32, 64, 48, 2);
        let vilain = new Character("Brown Bag", sprite);
        vilain.maxLife = vilain.life = 100;
        vilain.reverse = true;
        vilain.isVilain = true;

        vilain.spells.push(new PnjSpell(new ProjectileStat(hamerSprite, 80, 40, 7), castSimpleProjectile));
        vilain.onUpdate = function(self){
            if(self.isEnraged){
                return;
            }
            if(self.life > vilain.maxLife / 2){
                return;
            }
            self.isEnraged = true;
            const stat = new ProjectileStat(enragedSprite, 250, 40, 15)
            self.pushBuff(new CharacterBuffEffect("Enraged", self, enragedIcon, 45, 100000, stat, enragedTick));
        }        
        return vilain;
    }

    createBigZombie(){
        let boss = new Character("Big Zombie", bigZombySprite);
        boss.maxLife = boss.life = 5000;
        boss.reverse = true;
        boss.isVilain = true;
        boss.spells.push(new PnjSpell(new ProjectileStat(hamerSprite, 100, 40, 7), castSimpleProjectile));
        boss.onUpdate = function(self) {
            if(self.isEnraged){
                return;
            }
            if(self.life > 2000){
                return;
            }
            self.isEnraged = true;
            const stat = new ProjectileStat(enragedSprite, 50, 40, 15)
            self.pushBuff(new CharacterBuffEffect("Enraged", self, enragedIcon, 45, 100000, stat, enragedTick));
        }
        return boss;
    }
}
const vilainsFactory = new Vilains();

const knight = heroesFactory.createKnight();
const witch = heroesFactory.createWitch();
const hunter = heroesFactory.createHunter();
let boss = vilainsFactory.createBigZombie();

let currentLevel = 1;
let teams = [
    knight,
    witch,
    hunter
];
let mobs = [
    boss
]

function castSimpleProjectile(stat, from) {
    let target = from.isVilain ? teams.find(p => p.life > 0) : mobs.find(p => p.life > 0);
    if (!target) return;
    const projectile = new ProjectileAnim(stat, from, target);
    allAnimations.push(projectile);
}


function enragedTick(stat, boss){
    for (const c of teams) {
        if(c.life > 0){
            const projectile = new ProjectileAnim(stat, boss, c);
            allAnimations.push(projectile);
        }
    }
}

let characterMenus = [
    new CharacterMenu(knight, 0),
    new CharacterMenu(witch, 1),
    new CharacterMenu(hunter, 2),
    new CharacterMenu(boss, 0),
]

class PlayerSpell {
    constructor(name, icon, mana, castingTime, cooldown, power, effect) {
        this.name = name;
        this.icon = icon;
        this.mana = mana;
        this.castingTime = castingTime;
        this.cooldown = cooldown;
        this.power = power;
        this.effect = effect;
    }    
}

class PlayerCasting {
    constructor(playerSpell, target){
        this.spell = playerSpell;
        this.target = target;
        this.endTick =  this.spell.castingTime;
        this.tick = 0;
    }
    update(){
        this.tick++;
        if(this.tick <= this.endTick){
            return;
        }
        playerCastingBar = null;
        playerStat.mana -= this.spell.mana;
        playerStat.lastCast = tickNumber;
        this.spell.effect(this.spell, this.target);
    }
    paint(){
        const left = CanvasWidth / 2 - 100;
        const top = 340;
        
        if(this.endTick <= 0)
            return;

        ctx.beginPath();
        ctx.lineWidth = "1";
        ctx.fillStyle = "blue";
        ctx.rect(left, top + 10,  this.tick * 200 / this.endTick, 20);
        ctx.fill();

        ctx.beginPath();
        ctx.lineWidth = "1";
        ctx.strokeStyle = "gray";
        ctx.rect(left, top + 10, 200, 20);
        ctx.stroke();
    }
}

let playerCastingBar = null;

class SpellButton {
    constructor(playerSpell) {
        this.spell = playerSpell;
        this.icon = this.spell.icon;
        this.x = 0;
        this.y = 0;
        this.width = 48;
        this.height = 48;
        this.selected = false;
    }
    paint() {
        ctx.drawImage(this.icon, this.x, this.y, this.width, this.height);

        ctx.fillStyle = "yellow";
        ctx.font = "12px Arial";
        let label = this.spell.name
        ctx.fillText(label, this.x + 8, this.y + 38);

        if (this.selected) {
            ctx.beginPath();
            ctx.lineWidth = "3";
            ctx.strokeStyle = "orange";
            ctx.rect(this.x, this.y, this.width, this.height);
            ctx.stroke();
        }
    }
    update() {        
    }
    click() {
        this.selected = !this.selected;
        if(this.selected){
            for(let s of spells){
                if(s != this)
                    s.selected = false;
            }
        } else {
            playerCastingBar = null;
        }
    }
    cast(target) {
        if(playerCastingBar != null){
            return;
        }
        this.selected = false;
        if(this.spell.mana <= playerStat.mana){
            playerCastingBar = new PlayerCasting(this.spell, target);
        }
    }
}

const fastHeal = new PlayerSpell("Fast", fastHealIcon, 100, 30, 0, 250, healCasted);
const slowHeal = new PlayerSpell("Big", slowHealIcon, 140, 90, 0, 500, healCasted);
const hotHeal = new PlayerSpell("HOT", hotHealIcon, 80, 10, 0, 400/40, hotHealCaster);
const aoeHeal = new PlayerSpell("AOE", aoeHealIcon, 70, 30, 0, 200, aoeHealCasted);
//const shieldHeal = new PlayerSpell(shieldHealIcon, 80, 90, 0, 300, healCasted);


function healCasted(stat, target){
    target.onHeal(stat.power);
}
function hotHealCaster(stat, target){
    target.pushBuff(new CharacterBuffEffect("HOT", target, stat.icon, 15, 30*20, stat, healCasted));
}
function aoeHealCasted(stat, target){
    for (const c of teams) {
        c.onHeal(stat.power);
    }
}

class CharacterBuffEffect{
    constructor(name, character, icon, period, duration, stat, onTick){
        this.name = name;
        this.character = character;        
        this.icon = icon;
        this.period = period;
        this.start = tickNumber;
        this.duration = duration;
        this.onTick = onTick;
        this.stat = stat;      
    }
    update(){
        const ellapsed = tickNumber - this.start;        
        if(ellapsed % this.period == 0){
            this.onTick(this.stat, this.character);
        }
        if(ellapsed > this.duration){
            return true;
        }
        return false;
    }
}

let spells = [
    new SpellButton(fastHeal),
  //  new SpellButton(slowHeal),
    new SpellButton(hotHeal),
  //  new SpellButton(aoeHeal),
  //  new SpellButton(shieldHeal)
];

for (let i = 0; i < spells.length; i++) {
    spells[i].x = 300 + i * (spells[i].width + 2);
    spells[i].y = CanvasHeigth - spells[i].height - 20;
}
class PlayerStat{
    constructor(){
        this.maxMana = 800;
        this.mana = 800;
        this.lastCast = 0;
        this.manaRegen = 0;
        this.fullManaRegen = 20;
        this.liteManaRegen = 5;
    }
    paint(){
        const left = 300;
        const top = 420;

        ctx.beginPath();
        ctx.lineWidth = "1";
        ctx.fillStyle = "blue";
        ctx.rect(left, top + 10, this.mana * 200 / this.maxMana, 20);
        ctx.fill();

        ctx.fillStyle = "green";
        ctx.font = "12px Arial";
        let label = "" + this.mana + " ( +" + this.manaRegen + ") / " +  this.maxMana;
        ctx.fillText(label, left + 80, top + 24);

        ctx.beginPath();
        ctx.lineWidth = "1";
        ctx.strokeStyle = "gray";
        ctx.rect(left, top + 10, 200, 20);
        ctx.stroke();
    }
    update(){
        const regenTick = tickNumber - this.lastCast;
        this.manaRegen = (regenTick >  6 * 30) ? this.fullManaRegen :
            (regenTick >  3 * 30) ? this.liteManaRegen : 0;
        if(regenTick % 30 == 0){
            this.mana = Math.min(this.maxMana, this.mana + this.manaRegen);
        }
    }
}
let playerStat = new PlayerStat();
class Board {
    constructor() {
        characterMenus = [];
        for(let i = 0; i < teams.length; i++){
            characterMenus.push(new CharacterMenu(teams[i], i));
            teams[i].life = teams[i].maxLife;
        }
        const vilain = vilainsFactory.createVilainOfLevel(currentLevel);
        mobs = [vilain];
        characterMenus.push(new CharacterMenu(vilain, 0));
        this.placeCharacters();
        this.combatEnded = null;
        playerStat.mana = playerStat.maxMana;

    }

    placeCharacters(){
        const vilain = mobs[0];
        vilain.x = 620;
        vilain.y = 240;
        const tank = teams.find(c => c.isTank) ?? teams[teams.length - 1];
        tank.x = 560;
        tank.y = 225;
        const rangeds = teams.filter(c => c != tank);
        for(let i = 0; i < rangeds.length; i++){

            rangeds[i].x = 450 - Math.floor(i/3) * 100;
            rangeds[i].y = 100 + (i % 3) * 100;
        }
    }

    paint() {
        for (const c of teams) {
            c.paint();
        }
        for (const c of mobs) {
            c.paint();
        }
        for (let m of characterMenus) {
            m.paint();
        }
        for (const s of spells) {
            s.paint();
        }
        for (const a of allAnimations) {
            a.paint();
        }
        if(playerCastingBar)
            playerCastingBar.paint();
        playerStat.paint();
        if(this.combatEnded != null){
            if(teams[0].life <= 0){
                ctx.fillStyle = "darkred";
                ctx.font = "24px Verdana";
                ctx.fillText("Pelin is dead", 500, 200);
            } else {
                ctx.fillStyle = "darkgreen";
                ctx.font = "24px Verdana";
                ctx.fillText("Victory!", 500, 200);
            }
        }
    }
    update() {
        for (let i = 0; i < allAnimations.length; i++) {
            if (allAnimations[i].update()) {
                allAnimations.splice(i--, 1);
            }
        }        
        for (const c of teams) {
            c.update();
        }
        for (const c of mobs) {
            c.update();
        }
        for (const s of spells) {
            s.update();
        }
        if(playerCastingBar)
            playerCastingBar.update();
        playerStat.update();
        if(this.combatEnded == null){
            if(teams.filter(c => c.life > 0).length == 0 || mobs.filter(c => c.life > 0).length == 0 ){
                this.combatEnded = 80;
            }
        }
        else if(this.combatEnded <= 0){
            if(teams[0].life <= 0) {
                currentPage = new DeadScreen();
            } else{
                currentPage = new SelectUpgradeScreen();
            }
        } else {
            this.combatEnded--;
        }      
    }
    click(x, y) {
        for (const s of spells) {
            if (x >= s.x && x < s.x + s.width
                && y >= s.y && y < s.y + s.height) {
                s.click();
            }
        }
        let selectedChar = null;
        for (let m of characterMenus) {
            if (x >= m.x && x < m.x + m.width
                && y >= m.y && y < m.y + m.height) {
                selectedChar = m.character;
            }
        }
        if (selectedChar != null) {
            for (const s of spells) {
                if (s.selected) {
                    s.cast(selectedChar);
                    break;
                }
            }
        }
    }
}

class MenuButton {
    constructor(x, y, label, click) {
        this.x = x;
        this.y = y;
        this.label = label;
        this.click = click;
        this.width = 200;
        this.height = 44;
        this.mouseOver = false;
    }
    paint() {
        ctx.fillStyle = this.mouseOver ? "silver" : "gray";
        ctx.fillRect(this.x, this.y, this.width, this.height);

        ctx.fillStyle = "black";
        ctx.font = "32px Verdana";
        ctx.fillText(this.label, this.x + this.width / 2 - this.label.length * 8, this.y + 33);
    }
    isInside(event){
        return event.offsetX >= this.x && event.offsetX < this.x + this.width
            && event.offsetY >= this.y && event.offsetY < this.y + this.height
    }
    mouseEnter() {
        this.mouseOver = true;
    }
    mouseExit() {
        this.mouseOver = false;
    }    
}

class StartMenu{
    constructor(){
        this.buttons = [new MenuButton(500, 350, "Start", this.startGame)]
    }
    update(){}
    paint(){
        ctx.fillStyle = "black";
        ctx.font = "24px Verdana";
        ctx.fillText("You are Pelin:", 100, 100);
        healerSprite.paint(280, 60)
        ctx.fillText("Your power is to heal.", 100, 150);
        ctx.fillText("Descent to the dungeon, gather a group and", 100, 200);
        ctx.fillText("increase your stats to clean the dungeon.", 100, 230);
        for(let b of this.buttons){
            b.paint();
        }
    }
    startGame() {
        currentLevel = 1;
        teams = [heroesFactory.createPelin()];
        currentPage = new Board();
    }
}

class SelectUpgradeScreen {
    constructor(){
        this.upgrades = upgradeFactory.propose3Upgrades();
        this.buttons = []
        for(let i = 0; i < this.upgrades.length; i++){
          this.buttons.push(new MenuButton(50 + i * 250, 350, "OK", () => this.selectUpgrade(i)))
        }
    }
    update(){}

    paint(){
        ctx.fillStyle = "black";
        ctx.font = "30px Verdana";
        ctx.fillText("Select one bonus:", 250, 40);
        for(let i = 0 ; i < this.upgrades.length; i++){
            const upgrade = this.upgrades[i];
            upgrade.sprite.paint(50 + i * 250, 100);
            ctx.fillStyle = "black";
            ctx.font = "16px Verdana";
            for(let line = 0 ; line < upgrade.desc.length; line++){
                ctx.fillText(upgrade.desc[line], 50 + i * 250, 200 + line * 24);    
            }
        }
        for(let b of this.buttons){
            b.paint();
        }
    }
    selectUpgrade(index){
        upgradeFactory.click(this.upgrades[index]);
        this.nextLevel();
    }
    nextLevel() {
        currentLevel++;        
        currentPage = new Board();
    }
}

class DeadScreen {
    constructor(){
        this.buttons = [new MenuButton(500, 350, "Ok", this.goToMainMenu)]
    }
    update(){}
    paint(){
        ctx.fillStyle = "black";
        ctx.font = "24px Verdana";
        ctx.fillText("You are dead", 100, 100);        
        for(let b of this.buttons){
            b.paint();
        }
    }
    goToMainMenu() {        
        currentPage = new StartMenu();
    }
}

let currentPage = new StartMenu();
currentPage = new SelectUpgradeScreen();

const tickDuration = 1000.0 / 30;
function tick() {
    tickNumber++;
    update();
    paint();
    setTimeout(tick, tickDuration);
}
function update() {
    currentPage.update();
}
function paint() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    currentPage.paint();
}
function onmousedown(event) {
    if(currentPage.click){
        currentPage.click(event.offsetX, event.offsetY);
    }
    if(currentPage.buttons){
        for (const c of currentPage.buttons) {
            if (c.isInside(event)) {
                c.click(event);
            }
        }
    }
}

let currentControl = null;
function onmousemove(event) {
    if(!currentPage.buttons)
        return;
    let newControl = null
    for (const c of currentPage.buttons) {
        if (c.isInside(event)) {
            newControl = c;
            break;
        }
    }
    if (currentControl === newControl) {
        return;
    }
    if (currentControl && currentControl.mouseExit)
        currentControl.mouseExit(event);
    if (newControl && newControl.mouseEnter)
        newControl.mouseEnter(event);
    currentControl = newControl;
}
tick();