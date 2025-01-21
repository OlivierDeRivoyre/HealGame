const gameDuration = 30.0;
const CanvasWidth = 800;
const CanvasHeigth = 450;
const canvas = document.getElementById("myCanvas");
const ctx = canvas.getContext("2d");
let tickNumber = 1;
canvas.onmousedown = onmousedown;


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

const witchSprite = new Sprite(tileSet1, 256, 274, 288, 48, 9);
const redKnightSprite = new Sprite(tileSet1, 256, 148, 256, 48, 8);
const elfSprite = new Sprite(tileSet1, 256, 84, 256, 44, 8);
const bigZombySprite = new Sprite(tileSet1, 40, 668, 492, 68, 8);
const arrowSprite = new Sprite(tileSet1, 644, 400, 20, 48, 1);
const frostSprite = new Sprite(tileSet2, 352, 672, 32, 32, 1);
const swordSprite = new Sprite(tileSet1, 640, 16, 28, 48, 1);
const hamerSprite = new Sprite(tileSet1, 640, 76, 28, 48, 1);
const enragedSprite = new Sprite(tileSet2, 32, 0, 32, 32, 1);
enragedSprite.correctAngus = - 3 * Math.PI / 4;

class Character {
    constructor(sprite, x, y) {
        this.sprite = sprite;
        this.x = x;
        this.y = y;
        this.isVilain = false;
        this.width = sprite.singleWidth;
        this.height = sprite.tHeight;
        this.maxLife = 1000;
        this.life = 800;
        this.target = null;
        this.reverse = false;
        this.spells = [];
        this.buffs = [];
        this.onUpdate = null;
    }

    paint() {
        this.sprite.paint(this.x, this.y, Math.floor(tickNumber / 8) % 2, this.reverse);       
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
    constructor(icon, speed, range, dmg, cooldown) {
        this.icon = icon;
        this.speed = speed;
        this.range = range;
        this.dmg = dmg;
        this.cooldown = cooldown;
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


const knight = new Character(redKnightSprite, 560, 225);
knight.maxLife = knight.life = 1600;
const witch = new Character(witchSprite, 460, 100);
witch.maxLife = witch.life = 600;
const hunter = new Character(elfSprite, 350, 150);
hunter.maxLife = hunter.life = 800;
let boss = new Character(bigZombySprite, 600, 200);
boss.maxLife = boss.life = 5000;
boss.reverse = true;
boss.isVilain = true;
let teams = [
    knight,
    witch,
    hunter
];
let mobs = [
    boss
]

function castSimpleProjectile(stat, from) {
    let target = from.isVilain ? teams.find(p => p.life > 0) : boss;
    if (!target) return;
    const projectile = new ProjectileAnim(stat, from, target);
    allAnimations.push(projectile);
}
hunter.spells.push(new PnjSpell(new ProjectileStat(arrowSprite, 10, 800, 50, 38), castSimpleProjectile));
witch.spells.push(new PnjSpell(new ProjectileStat(frostSprite, 12, 1200, 40, 44), castSimpleProjectile));
knight.spells.push(new PnjSpell(new ProjectileStat(swordSprite, 7, 100, 30, 38), castSimpleProjectile));
boss.spells.push(new PnjSpell(new ProjectileStat(hamerSprite, 7, 100, 100, 40), castSimpleProjectile));
boss.onUpdate = function(self){
    if(self.isEnraged){
        return;
    }
    if(self.life > 2000){
        return;
    }
    self.isEnraged = true;
    const stat = new ProjectileStat(enragedSprite, 15, 1000, 50, 40)
    self.pushBuff(new CharacterBuffEffect("Enraged", self, enragedIcon, 45, 100000, stat, enragedTick));
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

class PlayerCasting{
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
    new SpellButton(slowHeal),
    new SpellButton(hotHeal),
    new SpellButton(aoeHeal),
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

function onmousedown(event) {
    mainPage.click(event.offsetX, event.offsetY);
}

let mainPage = new Board();

const tickDuration = 1000.0 / 30;
function tick() {
    tickNumber++;
    update();
    paint();
    setTimeout(tick, tickDuration);
}

function update() {
    mainPage.update();
}

function paint() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    mainPage.paint();
}

tick();