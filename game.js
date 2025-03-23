const gameDuration = 30.0;
const CanvasWidth = 800;
const CanvasHeight = 450;
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
function square(x) {
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
const hasteBuffIcon = loadImg("76")

class Sprite {
    constructor(tile, tx, ty, tWidth, tHeight, nbImage) {
        this.tile = tile;
        this.tx = tx;
        this.ty = ty;
        this.tWidth = tWidth;
        this.tHeight = tHeight;
        this.singleWidth = tWidth / nbImage;
        this.correctAngus = 0;
        this.forbidRotate = false;
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
        if (this.forbidRotate) {
            this.paint(x, y, 0, false);
            return;
        }
        ctx.save();
        ctx.translate(x + this.singleWidth / 2, y + this.tHeight / 2);
        ctx.rotate(angus + this.correctAngus);
        ctx.drawImage(this.tile,
            this.tx, this.ty, this.singleWidth - 1, this.tHeight,
            -this.singleWidth / 2, -this.tHeight / 2, (this.singleWidth - 1), this.tHeight);
        ctx.restore();
    }
    paintScale(x, y, width, height) {
        ctx.drawImage(this.tile,
            this.tx, this.ty,
            this.singleWidth - 1, this.tHeight,
            x, y, width, height);
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
const knifeSprite = new Sprite(tileSet1, 580, 16, 24, 32, 1);
const hamerSprite = new Sprite(tileSet1, 640, 76, 28, 48, 1);
const enragedSprite = new Sprite(tileSet2, 32, 0, 32, 32, 1);
enragedSprite.correctAngus = - 3 * Math.PI / 4;
const deadSprite = new Sprite(tileSet2, 0, 0, 32, 32, 1);
const greenPotionSprite = new Sprite(tileSet1, 640, 672, 28, 28, 1);
greenPotionSprite.forbidRotate = true;
const brokenArmorSprite = new Sprite(tileSet2, 160, 128, 32, 32, 1);
const invulnerableSprite = new Sprite(tileSet2, 64, 192, 32, 32, 1);

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
        this.talents = {};
        this.selectedTalents = [];
        this.level = 1;
        this.armor = 0;
        this.armorBroken = 0;
        this.crit = 0;
        this.haste = 0;
        this.dodge = 5;
        this.canBlock = false;
        this.slow = 0;
        this.ultimatePower = 0;
    }
    paint() {
        let spriteNumber = Math.floor(tickNumber / 8) % 2;
        if (this.life <= 0) {
            spriteNumber = 0;
        }
        this.sprite.paint(this.x, this.y, spriteNumber, this.reverse);
        if (this.life <= 0) {
            deadSprite.paint(this.x + 10, this.y + 10);
        }
    }
    update() {
        if (this.life <= 0)
            return;
        for (let spell of this.spells) {
            spell.update(this);
        }
        for (let i = this.buffs.length - 1; i >= 0; i--) {
            if (this.buffs[i].update()) {
                this.buffs.splice(i, 1);
            }
        }
        if (this.onUpdate) {
            this.onUpdate(this);
        }
    }
    onHit(projectileStat) {
        if (Math.random() * 100 < this.dodge) {
            allAnimations.push(new LabelAnim("dodge", this, "dodge", 0));
            return;
        }
        const isCrit = Math.random() * 100 < projectileStat.from.crit;
        const fullDamge = isCrit ? projectileStat.dmg * 2 : projectileStat.dmg;
        const remainingArmor = Math.max(0, this.armor * (100 - this.armorBroken) / 100);
        const dmg = Math.floor(fullDamge * 100 / (100 + remainingArmor))
        this.life = Math.max(0, this.life - dmg);
        allAnimations.push(new LabelAnim(`${dmg}`, this, isCrit ? "crit" : "hit", dmg));
        if (this.life <= 0) {
            this.buffs = [];
            return;
        }
        if (projectileStat.hitFunc != null) {
            projectileStat.hitFunc(this);
        }
    }
    onHeal(power, isCrit) {
        if (this.life <= 0) {
            return;
        }
        allAnimations.push(new LabelAnim(`${power}`, this, isCrit ? "critHeal" : "heal", power));
        this.life = Math.min(this.maxLife, this.life + power);
    }
    pushBuff(buff) {
        for (let i = this.buffs.length - 1; i >= 0; i--) {
            if (this.buffs[i].name == buff.name) {
                this.buffs.splice(i, 1);
            }
        }
        this.buffs.push(buff);
    }
    canHaveBonus(bonusKey) {
        if (!this.talents[bonusKey]) {
            return false;
        }
        if (this.selectedTalents.length < 3) {
            return true;
        }
        return this.selectedTalents.indexOf(bonusKey) != -1;
    }
    addBonus(bonusKey) {
        if (this.selectedTalents.indexOf(bonusKey) == -1) {
            this.selectedTalents.push(bonusKey);
        }
    }
    selectTarget() {
        if (this.target != null && this.target.life > 0) {
            return this.target;
        }
        if (!this.isVilain) {
            this.target = mobs.find(p => p.life > 0);
            return this.target;
        }
        let minD = 100000000;
        for (let c of teams.filter(p => p.life > 0)) {
            const d = square(this.x - c.x) + square(this.y - c.y);
            if (d < minD) {
                this.target = c;
                minD = d;
            }
        }
        return this.target;
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
        for (let i = 0; i < this.character.buffs.length; i++) {
            const offsetX = this.isLeft ? 40 : 0
            const imgX = this.x + offsetX + i * 22;
            const imgY = this.y + 32;
            this.character.buffs[i].paintScale(imgX, imgY, 20, 20);
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
        this.nextCastTick = this.cooldown;
    }
    update(pnj) {
        this.tick++;
        if (this.tick >= this.nextCastTick) {
            this.tick = null;
            this.nextCastTick = Math.floor(this.cooldown * (100 + pnj.slow) / (100 + pnj.haste));
            this.castFunc(this.stat, pnj);
        }
    }
}
class ProjectileStat {
    constructor(from, icon, dmg, cooldown, speed) {
        this.from = from;
        this.icon = icon;
        this.dmg = dmg;
        this.cooldown = cooldown;
        this.speed = speed;
        this.hitFunc = null;
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
        const d = Math.sqrt(square(this.destX - this.x) + square(this.destY - this.y));
        if (d < this.stat.speed) {
            this.to.onHit(this.stat);
            return true;
        }
        this.x += (this.destX - this.x) * this.stat.speed / d;
        this.y += (this.destY - this.y) * this.stat.speed / d;
        return false;
    }
    paint() {
        this.stat.icon.paintRotate(this.x, this.y, this.targetAngus + Math.PI / 2);
    }
}
class LabelAnim {
    constructor(label, from, type, power) {
        this.label = label;
        this.x = from.x + from.width / 2 - 5;
        this.y = from.y - 5
        this.tick = 0;
        this.color = "red";
        this.font = "12px Arial";
        switch (type) {
            case "hit":
                if (power < 20) {
                    this.font = "10px Arial";
                } else if (power < 50) {
                    this.font = "12px Arial";
                } else if (power < 150) {
                    this.font = "14px Arial";
                } else if (power < 250) {
                    this.font = "16px Arial";
                } else {
                    this.font = "18px Arial";
                }
                break;
            case "crit":
                if (power < 20) {
                    this.font = "14px Arial";
                } else if (power < 50) {
                    this.font = "16px Arial";
                } else if (power < 150) {
                    this.font = "18px Arial";
                } else if (power < 250) {
                    this.font = "20px Arial";
                } else {
                    this.font = "22px Arial";
                }
                break;
            case "heal":
                this.color = "green";
                if (power < 50) {
                    this.font = "10px Arial";
                } else if (power < 90) {
                    this.font = "12px Arial";
                } else if (power < 200) {
                    this.font = "14px Arial";
                } else if (power < 400) {
                    this.font = "16px Arial";
                } else {
                    this.font = "18px Arial";
                }
                break;
            case "critHeal":
                this.color = "green";
                if (power < 50) {
                    this.font = "14px Arial";
                } else if (power < 90) {
                    this.font = "16px Arial";
                } else if (power < 200) {
                    this.font = "18px Arial";
                } else if (power < 400) {
                    this.font = "20px Arial";
                } else {
                    this.font = "24px Arial";
                }
                break;
            case "dodge": this.color = "gray"; break;
            case "block": this.color = "gray"; break;
        }
        this.vx = Math.random() * 0.6 - 0.3;
        this.vy = 1.5;
    }
    update() {
        this.tick++;
        if (this.tick > 30 * 1) {
            return true;
        }
        this.x += this.vx;
        this.y -= this.vy;
        return false;
    }
    paint() {
        ctx.fillStyle = this.color;
        ctx.font = this.font;
        ctx.fillText(this.label, Math.floor(this.x), Math.floor(this.y));
    }
}

class Heroes {
    createPelin() {
        const c = new Character("Pelin", healerSprite);
        c.maxLife = c.life = 800;
        const banana = new Sprite(tileSet2, 32, 450, 32, 32, 1);
        c.spells.push(new PnjSpell(new ProjectileStat(c, banana, 15, 45, 10), castSimpleProjectile));
        c.talents = {
            life: 1,
            mana: 1,
            regen: 1,
            healPower: 1,
            haste: 1,
            crit: 1,
        };
        return c;
    }
    createKnight() {
        const c = new Character("Knight", redKnightSprite);
        c.maxLife = c.life = 1000;
        c.isTank = true;
        c.spells.push(new PnjSpell(new ProjectileStat(c, swordSprite, 30, 38, 7), castSimpleProjectile));
        c.talents = {
            life: 1,
            blockBuff: 1,
            armor: 1,
            dodge: 1,
            damage: 1,
        };
        return c;
    }
    createWitch() {
        const c = new Character("Witch", witchSprite);
        c.maxLife = c.life = 600;
        const projectile = new ProjectileStat(c, frostSprite, 40, 44, 12);
        projectile.hitFunc = function (target) {
            if (c.ultimatePower == 0) {
                return;
            }
            target.slow = c.ultimatePower;
            const buff = new CharacterBuffEffect("Frozen", target, frostSprite, 60, 60, {}, `Slow attacks by ${c.ultimatePower}%`, function () {
                target.slow = 0;
            });
            target.pushBuff(buff);
        };
        c.spells.push(new PnjSpell(projectile, castSimpleProjectile));
        c.talents = {
            life: 1,
            frostBuff: 1,
            armor: 1,
            damage: 1,
            haste: 1,
            crit: 1,
        };
        return c;
    }
    createHunter() {
        const c = new Character("Hunter", elfSprite);
        c.maxLife = c.life = 700;
        c.ultimatePower = 50;
        const projectile = new ProjectileStat(c, arrowSprite, 50, 38, 10)
        projectile.hitFunc = function (target) {
            if (c.ultimatePower == 0) {
                return;
            }
            target.armorBroken = c.ultimatePower;
            const buff = new CharacterBuffEffect("Broken Armor", target, brokenArmorSprite, 60, 60, {}, `Reduce armor by ${c.ultimatePower}%`, function () {
                target.armorBroken = 0;
            });
            target.pushBuff(buff);
        };
        c.spells.push(new PnjSpell(projectile, castSimpleProjectile));
        c.talents = {
            life: 1,
            breakArmorBuff: 1,
            armor: 1,
            dodge: 1,
            damage: 1,
            haste: 1,
            crit: 1,
        };
        return c;
    }
}
const heroesFactory = new Heroes();

class UpgradeFactory {

    propose3Upgrades() {

        // 0-1 of lvlup spell / recruit
        // 3-2 of level up options on one character
        const pnjs = [];
        this.addPnjs(pnjs);
        if (teams.length == 1) {
            let selected = [];
            this.randomPick(pnjs, selected, 3);
            return selected;
        }
        const upgradeSpells = [];
        this.addSpells(upgradeSpells);
        const heros = [];
        this.addLevelUpForOneHero(heros);
        let selected = [];
        if (spells.length < 5 && upgradeSpells.length != 0 && Math.random() < 0.5) {
            this.randomPick(upgradeSpells, selected, 1);
        } else if (teams.length < 7) {
            this.randomPick(pnjs, selected, 1);
        }
        this.randomPick(heros, selected, 3);
        return selected;
    }
    randomPick(array, selected, n) {
        for (let i = 0; i < n && array.length > 0 && selected.length < 3; i++) {
            let r = getRandomInt(0, array.length);
            selected.push(array[r]);
            array.splice(r, 1);
        }
    }

    click(upgrade) {
        upgrade.click();
    }
    proposePnj(pnj, desc) {
        return {
            sprite: pnj.sprite,
            desc: desc,
            click: () => {
                teams.push(pnj);
            }
        };
    }
    addPnjs(array) {
        array.push(this.addKnight());
        array.push(this.addWitch());
        array.push(this.addHunter());
    }
    addKnight() {
        const c = heroesFactory.createKnight();
        return this.proposePnj(c, ["Recruit the knight", "He can reduce", "the damage with his shield"]);
    }
    addWitch() {
        const c = heroesFactory.createWitch();
        return this.proposePnj(c, ["Recruit the witch", "She can slow the", "attacks of the ennemy"]);
    }
    addHunter() {
        const c = heroesFactory.createHunter();
        return this.proposePnj(c, ["Recruit the hunter", "He can reduce the", "armor of the ennemy"]);
    }
    proposeSpell(spell, desc) {
        return {
            sprite: new Sprite(spell.icon, 0, 0, 48, 48, 1),
            desc: desc,
            click: () => {
                spells.push(spell);
            }
        };
    }
    addSpells(array) {
        if (spells.indexOf(fastHeal2) == -1) {
            array.push(this.proposeSpell(fastHeal2, ["Fast Heal level 2", `Heals ${fastHeal2.power}`, `Mana: ${fastHeal2.mana}`]));
        }
        if (spells.indexOf(slowHeal1) == -1) {
            array.push(this.proposeSpell(slowHeal1, ["Slow Heal", `Heals ${slowHeal1.power}`, `Mana: ${slowHeal1.mana}`]));
        } else if (spells.indexOf(slowHeal2) == -1) {
            array.push(this.proposeSpell(slowHeal2, ["Slow Heal level 2", `Heals ${slowHeal2.power}`, `Mana: ${slowHeal2.mana}`]));
        }
        if (spells.indexOf(aoeHeal) == -1) {
            array.push(this.proposeSpell(aoeHeal, ["Group Heal", `Share ${aoeHeal.power} heals`, `Mana: ${aoeHeal.mana}`]));
        }
    }
    pushLevelUp(array, hero, desc, action) {
        array.push({
            sprite: hero.sprite,
            desc: desc,
            click: () => {
                hero.level++;
                action();
            }
        });
    }
    addLevelUpForOneHero(array) {
        const hero = teams[getRandomInt(0, teams.length)];
        if (hero.canHaveBonus("life")) {
            let incr = 100 + hero.talents.life * 100;
            this.pushLevelUp(array, hero, [`Level up ${hero.name} to level ${hero.level + 1}`, `Increase max life of ${hero.name}`, `From ${hero.maxLife}`, `To ${hero.maxLife + incr}`], function () {
                hero.talents.life++;
                hero.maxLife += incr;
                hero.addBonus("life")
            });
        }
        if (hero.canHaveBonus("armor")) {
            let incr = hero.talents.armor * 25;
            this.pushLevelUp(array, hero, [`Level up ${hero.name} to level ${hero.level + 1}`, `Increase armor of ${hero.name}`, `From ${hero.armor}`, `To ${hero.armor + incr}`], function () {
                hero.talents.armor++;
                hero.armor += incr;
                hero.addBonus("armor")
            });
        }
        if (hero.canHaveBonus("damage")) {
            let incr = 5;
            this.pushLevelUp(array, hero, [`Level up ${hero.name} to level ${hero.level + 1}`, `Increase damage of ${hero.name}`, `From ${hero.spells[0].stat.dmg}`, `To ${hero.spells[0].stat.dmg + incr}`], function () {
                hero.talents.damage++;
                hero.spells[0].stat.dmg += incr;
                hero.addBonus("damage")
            });
        }
        if (hero.canHaveBonus("crit")) {
            let incr = 25;
            this.pushLevelUp(array, hero, [`Level up ${hero.name} to level ${hero.level + 1}`, `Increase critical chance`, `From ${hero.crit} %`, `To ${hero.crit + incr} %`], function () {
                hero.talents.crit++;
                hero.crit += incr;
                hero.addBonus("crit")
            });
        }
        if (hero.canHaveBonus("dodge")) {
            let incr = Math.max(3, 10 - hero.talents.dodge);
            this.pushLevelUp(array, hero, [`Level up ${hero.name} to level ${hero.level + 1}`, `Increase dodge chance`, `From ${hero.dodge} %`, `To ${hero.dodge + incr} %`], function () {
                hero.talents.dodge++;
                hero.dodge += incr;
                hero.addBonus("dodge")
            });
        }
        if (hero.canHaveBonus("haste")) {
            let incr = 20;
            this.pushLevelUp(array, hero, [`Level up ${hero.name} to level ${hero.level + 1}`, `Increase haste`, `From ${hero.haste}`, `To ${hero.haste + incr}`], function () {
                hero.talents.haste++;
                hero.haste += incr;
                hero.addBonus("haste")
            });
        }
        if (hero.canHaveBonus("mana")) {
            let incr = 100 + hero.talents.mana * 100;
            this.pushLevelUp(array, hero, [`Level up ${hero.name} to level ${hero.level + 1}`, `Increase mana`, `From ${playerStat.maxMana}`, `To ${playerStat.maxMana + incr}`], function () {
                hero.talents.mana++;
                playerStat.maxMana += incr;
                hero.addBonus("mana")
            });
        }
        if (hero.canHaveBonus("regen")) {
            let incr = 1 + hero.talents.regen;
            this.pushLevelUp(array, hero, [`Level up ${hero.name} to level ${hero.level + 1}`, `Increase mana regen`, `From ${playerStat.liteManaRegen} mana/s`, `To ${playerStat.liteManaRegen + incr} mana/s`], function () {
                hero.talents.regen++;
                playerStat.liteManaRegen += incr;
                playerStat.fullManaRegen += incr * 4;
                hero.addBonus("regen")
            });
        }
        if (hero.canHaveBonus("healPower")) {
            let incr = 10;
            this.pushLevelUp(array, hero, [`Level up ${hero.name} to level ${hero.level + 1}`, `Increase heal bonus`, `From ${playerStat.healPower} %`, `To ${playerStat.healPower + incr} %`], function () {
                hero.talents.regen++;
                playerStat.healPower += incr;
                hero.addBonus("healPower")
            });
        }

        if (hero.level >= 3) {
            if (hero.talents.blockBuff == 1) {
                this.pushLevelUp(array, hero, [`Level up ${hero.name} to level ${hero.level + 1}`, `Learn to block`, `30% chance to block`], function () {
                    hero.talents.blockBuff++;
                    hero.canBlock = true;
                });
            }
            if (hero.talents.frostBuff >= 1 && hero.talents.frostBuff < 3) {
                let incr = 20;
                this.pushLevelUp(array, hero, [`Level up ${hero.name} to level ${hero.level + 1}`, `Increase slow debuff`, `From ${hero.ultimatePower} %`, `To ${hero.ultimatePower + incr} %`], function () {
                    hero.talents.frostBuff++;
                    hero.ultimatePower += incr;
                });
            }
            if (hero.talents.breakArmorBuff >= 1 && hero.talents.breakArmorBuff < 3) {
                let incr = 20;
                this.pushLevelUp(array, hero, [`Level up ${hero.name} to level ${hero.level + 1}`, `Increase breaking armor`, `From ${hero.ultimatePower} %`, `To ${hero.ultimatePower + incr} %`], function () {
                    hero.talents.breakArmorBuff++;
                    hero.ultimatePower += incr;
                });
            }
        }
    }
}
let upgradeFactory = new UpgradeFactory();
let rerollsNumber = 2;
class Vilains {
    createVilainOfLevel(level) {
        let vilain = this.selectVilain(level);
        vilain.life = vilain.maxLife;
        vilain.reverse = true;
        vilain.isVilain = true;
        return vilain;
    }
    selectVilain(level) {
        switch (level) {
            case 1: return this.lvl1();
            case 2: return this.lvl2();
            case 3: return this.lvl3();
            case 4: return this.lvl4();
            default: return this.createBigZombie();
        }
    }

    lvl1() {
        const sprite = new Sprite(tileSet1, 736, 32, 64, 48, 2);
        let vilain = new Character("Brown Bag", sprite);
        vilain.maxLife = 100;
        vilain.spells.push(new PnjSpell(new ProjectileStat(vilain, knifeSprite, 80, 40, 7), castSimpleProjectile));
        vilain.spells.push(new EnragedAoeTrigger(0.5, 250));
        return vilain;
    }

    lvl2() {
        const sprite = new Sprite(tileSet1, 736, 80, 64, 48, 2);
        let vilain = new Character("Green Bag", sprite);
        vilain.maxLife = 800;
        vilain.armor = 10;
        vilain.spells.push(new PnjSpell(new ProjectileStat(vilain, knifeSprite, 80, 40, 7), castSimpleProjectile));
        vilain.spells.push(new EnragedAoeTrigger(0.5, 50));
        return vilain;
    }

    lvl3() {
        const sprite = new Sprite(tileSet1, 736, 124, 64, 48, 2);
        let vilain = new Character("Small Devil", sprite);
        vilain.maxLife = 1000;
        vilain.armor = 20;
        vilain.spells.push(new PnjSpell(new ProjectileStat(vilain, knifeSprite, 100, 40, 7), castSimpleProjectile));
        vilain.spells.push(new HasteBuffTrigger(0.3, 150, 30 * 4));
        return vilain;
    }

    lvl4() {
        const sprite = new Sprite(tileSet1, 736, 220, 64, 36, 2);
        let vilain = new Character("Brown Mud", sprite);
        vilain.maxLife = 1200;
        vilain.armor = 40;
        vilain.spells.push(new PnjSpell(new ProjectileStat(vilain, greenPotionSprite, 120, 40, 7), castSimpleProjectile));
        vilain.spells.push(new EnragedAoeTrigger(0.5, 50));
        return vilain;
    }

    createBigZombie() {
        let vilain = new Character("Big Zombie", bigZombySprite);
        vilain.maxLife = vilain.life = 5000;
        vilain.reverse = true;
        vilain.isVilain = true;
        vilain.spells.push(new PnjSpell(new ProjectileStat(vilain, hamerSprite, 100, 40, 7), castSimpleProjectile));
        vilain.spells.push(new EnragedAoeTrigger(0.4, 50));
        vilain.spells.push(new InvulnerableBuffTrigger(75, 8*30));
        vilain.spells.push(new InvulnerableBuffTrigger(40, 8*30));
        vilain.spells.push(new InvulnerableBuffTrigger(20, 8*30));
        return vilain;
    }
}
const vilainsFactory = new Vilains();


let currentLevel = 1;
let teams = [];
let mobs = [];
let characterMenus = [];

function castSimpleProjectile(stat, from) {
    let target = from.selectTarget();
    if (!target) return;
    const projectile = new ProjectileAnim(stat, from, target);
    allAnimations.push(projectile);
}
function enragedTick(stat, boss) {
    for (const c of teams) {
        if (c.life > 0) {
            const projectile = new ProjectileAnim(stat, boss, c);
            allAnimations.push(projectile);
        }
    }
}
class EnragedAoeTrigger {
    constructor(lifeRatio, dmg) {
        this.lifeRatio = lifeRatio;
        this.dmg = dmg;
    }
    update(self) {
        if (self.isEnragedAoe) {
            return;
        }
        if (self.life > self.maxLife * this.lifeRatio) {
            return;
        }
        self.isEnragedAoe = true;
        const stat = new ProjectileStat(self, enragedSprite, this.dmg, 40, 15)
        self.pushBuff(new CharacterBuffEffect("Enraged", self, enragedIcon, 45, 100000, stat, `Throw a ${this.dmg} fireball to all`, enragedTick));
    }
}
class HasteBuffTrigger {
    constructor(lifePeriodRatio, hasteIncr, duration) {
        this.lifePeriodRatio = lifePeriodRatio;
        this.hasteIncr = hasteIncr;
        this.duration = duration;
        this.nextLifeTrigger = null;
        this.period = null;
        this.isRunning = false;
    }
    update(self) {
        if (this.isRunning) {
            return;
        }
        if (this.nextLifeTrigger == null) {
            this.period = Math.floor(self.maxLife * this.lifePeriodRatio);
            this.nextLifeTrigger = self.maxLife - this.period;
        }
        if (self.life > this.nextLifeTrigger) {
            return;
        }
        this.nextLifeTrigger -= this.period;
        this.isRunning = true;
        self.haste += this.hasteIncr;
        const spell = this;
        const buff = new CharacterBuffEffect("Haste", self, hasteBuffIcon, this.duration, this.duration, {}, `Gain ${spell.hasteIncr} haste`, function () {
            if (spell.isRunning) {
                spell.isRunning = false;
                self.haste -= spell.hasteIncr;
            }
        });
        self.pushBuff(buff);
    }
}

class InvulnerableBuffTrigger {
    constructor(lifeRatio, duration) {
        this.lifeRatio = lifeRatio;
        this.duration = duration;
        this.nextLifeTrigger = null;     
        this.isDone = false;
    }
    update(self) {
        if (this.isDone) {
            return;
        }
        if (this.nextLifeTrigger == null) {
            this.nextLifeTrigger = Math.floor(self.maxLife * this.lifeRatio / 100);         
        }
        if (self.life > this.nextLifeTrigger) {
            return;
        }        
        this.isDone = true;
        self.dodge += 100;       
        const durationSec = Math.floor(this.duration / 3) / 10;
        const buff = new CharacterBuffEffect("Invulnerable", self, invulnerableSprite, this.duration, this.duration, {}, `Gain 100% invulnerable for ${durationSec} sec`, function () {                            
            self.dodge -= 100;                            
        });
        self.pushBuff(buff);
    }
}

class PlayerSpell {
    constructor(name, fullName, icon, mana, castingTime, rank, power, effect, description) {
        this.name = name;
        this.fullName = fullName;
        this.icon = icon;
        this.mana = mana;
        this.castingTime = castingTime;
        this.rank = rank;
        this.power = power;
        this.effect = effect;
        this.description = description;
    }
}

class PlayerCasting {
    constructor(playerSpell, target) {
        this.spell = playerSpell;
        this.target = target;
        this.endTick = Math.ceil(this.spell.castingTime * 100 / (100 + playerStat.haste));
        this.tick = 0;
    }
    update() {
        this.tick++;
        if (this.tick <= this.endTick) {
            return;
        }
        playerCastingBar = null;
        playerStat.mana -= this.spell.mana;
        playerStat.lastCast = tickNumber;
        this.spell.effect(this.spell, this.target);
    }
    paint() {
        const left = CanvasWidth / 2 - 100;
        const top = 340;

        if (this.endTick <= 0)
            return;

        ctx.beginPath();
        ctx.lineWidth = "1";
        ctx.fillStyle = "blue";
        ctx.rect(left, top + 10, this.tick * 200 / this.endTick, 20);
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
    click(spellButtons) {
        this.selected = !this.selected;
        if (this.selected) {
            tooltip.current = new SpellTooltip(this.spell);
            for (let s of spellButtons) {
                if (s != this) {
                    s.selected = false;
                }
            }
        } else if (!this.selected) {
            playerCastingBar = null;
            tooltip.current = null;
        }
    }
    cast(target) {
        if (playerCastingBar != null) {
            return;
        }
        this.selected = false;
        if (this.spell.mana <= playerStat.mana) {
            playerCastingBar = new PlayerCasting(this.spell, target);
        }
    }
}

const fastHeal1 = new PlayerSpell("Fast", "Fast heal", fastHealIcon, 100, 30, 1, 250, healCasted, "Heal any member of the teams");
const fastHeal2 = new PlayerSpell("Fast 2", "Fast heal", fastHealIcon, 160, 30, 2, 400, healCasted, "Fast and big, but mana costly");
const slowHeal1 = new PlayerSpell("Big", "Big heal", slowHealIcon, 140, 90, 3, 500, healCasted, "Mana efficient, but slow to cast");
const slowHeal2 = new PlayerSpell("Big 2", "Big heal", slowHealIcon, 200, 90, 4, 800, healCasted, "Big and efficient, but slow to cast");
const hotHeal = new PlayerSpell("HOT", "Heal over time", hotHealIcon, 80, 10, 5, 400 / 20, hotHealCaster, "Heal a little on every tick");
const aoeHeal = new PlayerSpell("AOE", "Heal all teams", aoeHealIcon, 120, 60, 6, 500, aoeHealCasted, "Share heal by all the teams");


function getPlayerSpellStats(spell) {
    let minHeal = Math.floor(spell.power * (100 + playerStat.healPower) / 100);
    let maxHeal = Math.floor(spell.power * (100 + playerStat.healPower + 10) / 100);
    let suffix = "";
    let crit = playerStat.crit;
    if (spell.name == "HOT") {
        crit = 0;
        suffix = " over 20 sec"
    }
    if (spell.name == "AOE") {
        minHeal = Math.floor(minHeal / teams.length);
        maxHeal = Math.floor(maxHeal / teams.length);
    }
    let castingTimeSec = Math.ceil(10 * spell.castingTime * 100 / (30 * (100 + playerStat.haste))) / 10;
    let mana = spell.mana;
    return { minHeal, maxHeal, suffix, crit, castingTimeSec, mana };
}
function trueHeal(power) {
    const poweredHeal = Math.floor(power * (100 + playerStat.healPower + Math.random() * 10) / 100);
    return poweredHeal;
}
function healCasted(stat, target) {
    const isCrit = Math.random() * 100 < playerStat.crit;
    target.onHeal(trueHeal(stat.power * (isCrit ? 3 : 1)), isCrit);
}
function hotHealCaster(stat, target) {
    target.pushBuff(new CharacterBuffEffect("Heal over time", target, stat.icon, 30, 30 * 20, stat, `Heal on each tick`, healCasted));
}
function aoeHealCasted(stat, target) {
    const heal = trueHeal(stat.power / teams.length);
    for (const c of teams) {
        c.onHeal(heal, false);
    }
}

class CharacterBuffEffect {
    constructor(name, character, icon, period, duration, stat, description, onTick) {
        this.name = name;
        this.character = character;
        this.icon = icon;
        this.period = period;
        this.start = tickNumber;
        this.duration = duration;
        this.onTick = onTick;
        this.stat = stat;
        this.description = description;
    }
    update() {
        if (tickNumber == this.start) {
            return;
        }
        const ellapsed = tickNumber - this.start;
        if (ellapsed % this.period == 0) {
            this.onTick(this.stat, this.character);
        }
        if (ellapsed > this.duration) {
            return true;
        }
        return false;
    }
    paintScale(x, y, width, height) {
        if (this.icon.paintScale) {
            this.icon.paintScale(x, y, width, height);
        } else {
            ctx.drawImage(this.icon, x, y, width, height);
        }
    }
}

let spells = [
    fastHeal1,
    hotHeal,
];

class PlayerStat {
    static left = 276;
    constructor() {
        this.maxMana = 800;
        this.mana = 800;
        this.lastCast = 0;
        this.manaRegen = 0;
        this.fullManaRegen = 20;
        this.liteManaRegen = 5;
        this.healPower = 0;
        this.haste = 0;
        this.crit = 0;
    }
    paint() {
        const width = 248;
        const top = 420;

        ctx.beginPath();
        ctx.lineWidth = "1";
        ctx.fillStyle = "blue";
        ctx.rect(PlayerStat.left, top + 10, this.mana * width / this.maxMana, 20);
        ctx.fill();

        ctx.fillStyle = "green";
        ctx.font = "12px Arial";
        let label = "" + this.mana + " ( +" + this.manaRegen + ") / " + this.maxMana;
        ctx.fillText(label, PlayerStat.left + 80, top + 24);

        ctx.beginPath();
        ctx.lineWidth = "1";
        ctx.strokeStyle = "gray";
        ctx.rect(PlayerStat.left + 1, top + 10, width - 2, 20);
        ctx.stroke();
    }
    update() {
        const regenTick = tickNumber - this.lastCast;
        this.manaRegen = (regenTick > 6 * 30) ? this.fullManaRegen :
            (regenTick > 3 * 30) ? this.liteManaRegen : 0;
        if (regenTick % 30 == 0) {
            this.mana = Math.min(this.maxMana, this.mana + this.manaRegen);
        }
    }
}
let playerStat = new PlayerStat();
class Board {
    constructor() {
        allAnimations = [];
        characterMenus = [];
        tooltip.current = null;
        playerCastingBar = null;
        for (let i = 0; i < teams.length; i++) {
            characterMenus.push(new CharacterMenu(teams[i], i));
            teams[i].life = teams[i].maxLife;
            teams[i].buffs = [];
        }
        const vilain = vilainsFactory.createVilainOfLevel(currentLevel);
        mobs = [vilain];
        characterMenus.push(new CharacterMenu(vilain, 0));
        this.placeCharacters();
        this.combatEnded = null;
        playerStat.haste = teams[0].haste;
        playerStat.crit = teams[0].crit;
        playerStat.mana = playerStat.maxMana;
        spells.sort((a, b) => a.rank - b.rank)
        this.spellButtons = [];
        for (let i = 0; i < spells.length; i++) {
            const button = new SpellButton(spells[i]);
            button.x = PlayerStat.left + i * (button.width + 2);
            button.y = CanvasHeight - button.height - 20;
            this.spellButtons.push(button)
        }
    }

    placeCharacters() {
        const vilain = mobs[0];
        vilain.x = 620;
        vilain.y = 240;
        const tank = teams.find(c => c.isTank) ?? teams[teams.length - 1];
        tank.x = 560;
        tank.y = 230;
        const rangeds = teams.filter(c => c != tank);
        for (let i = 0; i < rangeds.length; i++) {
            rangeds[i].x = 450 - Math.floor(i / 3) * 100;
            rangeds[i].y = 100 + (i % 3) * 100;
        }
    }

    paint() {
        if (tooltip)
            tooltip.paint();
        for (const c of teams) {
            c.paint();
        }
        for (const c of mobs) {
            c.paint();
        }
        for (let m of characterMenus) {
            m.paint();
        }
        for (const s of this.spellButtons) {
            s.paint();
        }
        for (const a of allAnimations) {
            a.paint();
        }
        if (playerCastingBar)
            playerCastingBar.paint();
        playerStat.paint();
        if (this.combatEnded != null) {
            if (teams[0].life <= 0) {
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
        for (const s of this.spellButtons) {
            s.update();
        }
        if (playerCastingBar)
            playerCastingBar.update();
        playerStat.update();
        if (this.combatEnded == null) {
            if (teams.filter(c => c.life > 0).length == 0 || mobs.filter(c => c.life > 0).length == 0) {
                this.combatEnded = 80;
            }
        }
        else if (this.combatEnded <= 0) {
            if (teams[0].life <= 0) {
                currentPage = new DeadScreen();
            } else {
                for (let i = teams.length - 1; i >= 0; i--) {
                    if (teams[i].life <= 0) {
                        teams.splice(i, 1);
                    }
                }
                currentPage = new SelectUpgradeScreen();
            }
        } else {
            this.combatEnded--;
        }
    }
    click(event) {
        for (const s of this.spellButtons) {
            if (isInside(s, event)) {
                s.click(this.spellButtons);
                return true;
            }
        }
        let selectedChar = null;
        for (let m of characterMenus) {
            if (isInside(m, event)) {
                selectedChar = m.character;
            }
        }
        if (isInside(tooltip, event)) {
            tooltip.click(event);
            return true;
        }
        if (selectedChar != null) {
            let spell = this.spellButtons.find(s => s.selected);
            if (spell) {
                spell.cast(selectedChar);
            } else {
                tooltip.current = new CharacterTooltip(selectedChar);
            }
            return true;
        }
        tooltip.current = null;
        return false;
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
        this.textX = null;
    }
    paint() {
        ctx.fillStyle = this.mouseOver ? "silver" : "gray";
        ctx.fillRect(this.x, this.y, this.width, this.height);

        ctx.fillStyle = "black";
        ctx.font = "32px Verdana";
        if (this.textX == null) {
            const textWidth = ctx.measureText(this.label).width;
            this.textX = this.x + this.width / 2 - textWidth / 2;
        }
        ctx.fillText(this.label, this.textX, this.y + 33);
    }
    mouseEnter() {
        this.mouseOver = true;
    }
    mouseExit() {
        this.mouseOver = false;
    }
}

class StartMenu {
    constructor() {
        this.buttons = [new MenuButton(500, 350, "Start", this.startGame)]
    }
    update() { }
    paint() {
        ctx.fillStyle = "black";
        ctx.font = "24px Verdana";
        ctx.fillText("You are Pelin:", 100, 100);
        healerSprite.paint(280, 60)
        ctx.fillText("Your power is to heal.", 100, 150);
        ctx.fillText("Descent to the dungeon, gather a group and", 100, 200);
        ctx.fillText("increase your stats to clean the dungeon.", 100, 230);
        for (let b of this.buttons) {
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
    constructor() {
        this.upgrades = upgradeFactory.propose3Upgrades();
        this.buttons = []
        for (let i = 0; i < this.upgrades.length; i++) {
            this.buttons.push(new MenuButton(50 + i * 250, 350, "OK", () => this.selectUpgrade(i)))
        }
        if (rerollsNumber > 0) {
            this.buttons.push(new MenuButton(CanvasWidth - 210, 10, `Reroll (${rerollsNumber})`, () => this.reroll()))
        } else {
            this.buttons.push(new MenuButton(CanvasWidth - 210, 10, `Skip`, () => this.skip()));
        }
    }
    update() { }

    paint() {
        ctx.fillStyle = "black";
        ctx.font = "30px Verdana";
        ctx.fillText("Select a bonus", 250, 40);
        for (let i = 0; i < this.upgrades.length; i++) {
            const upgrade = this.upgrades[i];
            upgrade.sprite.paint(50 + i * 250, 100);
            ctx.fillStyle = "black";
            ctx.font = "16px Verdana";
            for (let line = 0; line < upgrade.desc.length; line++) {
                ctx.fillText(upgrade.desc[line], 50 + i * 250, 200 + line * 24);
            }
        }
        for (let b of this.buttons) {
            b.paint();
        }
    }
    selectUpgrade(index) {
        upgradeFactory.click(this.upgrades[index]);
        this.nextLevel();
    }
    nextLevel() {
        currentLevel++;
        currentPage = new Board();
    }
    reroll() {
        rerollsNumber--;
        currentPage = new SelectUpgradeScreen();
    }
    skip() {
        rerollsNumber += 3;
        this.nextLevel();
    }
}

class DeadScreen {
    constructor() {
        this.buttons = [new MenuButton(500, 350, "Ok", this.goToMainMenu)]
    }
    update() { }
    paint() {
        ctx.fillStyle = "black";
        ctx.font = "24px Verdana";
        ctx.fillText("You are dead", 100, 100);
        for (let b of this.buttons) {
            b.paint();
        }
    }
    goToMainMenu() {
        currentPage = new StartMenu();
    }
}
class Tooltip{
    constructor() {
        this.current = null;
        this.isMinimized = false;
        this.x = CanvasWidth - 250;
        this.y = CanvasHeight - 150;
        this.width = 250;
        this.height = 150;                
    }
    paint() {
        if(!this.current){
            return;
        }
        ctx.beginPath();
        ctx.lineWidth = "1";
        ctx.fillStyle = "#303030";
        if(this.isMinimized){
            ctx.rect(this.x + this.width - 40, this.y + this.height - 24, 40, 24);
        } else {        
            ctx.rect(this.x, this.y, this.width, this.height);
        }
        ctx.fill();     
        if(!this.isMinimized){
            this.current.paint();
        }
    }
    click(event) {
        if(!this.current){
            return;
        } 
        if(!this.isMinimized && this.current.click && this.current.click(event)){
            return;            
        }
        this.isMinimized = !this.isMinimized;
    } 
}
const tooltip = new Tooltip();
class CharacterTooltip {
    constructor(character) {
        this.character = character;
        this.buffY = tooltip.y + tooltip.height - 20 - 8;
        this.buffX = tooltip.x + 8 + 56;
    }
    paint() {
        let cursorY = tooltip.y + 22;
        let cursorX = tooltip.x + 8;

        ctx.fillStyle = this.character.isVilain ? "red" : "green";
        ctx.font = "bold 18px Verdana";
        ctx.fillText(this.character.name, cursorX, cursorY);
        cursorY += 18;

        ctx.fillStyle = "white";
        ctx.font = "12px Verdana";
        const lvl = this.character.isVilain ? currentLevel : this.character.level;
        ctx.fillText(`Level: ${lvl}`, cursorX, cursorY);
        cursorY += 16;

        let dmg = this.character.spells[0].stat.dmg;
        let cooldown = Math.floor(0.34 * this.character.spells[0].stat.cooldown * (100 + this.character.slow) / (100 + this.character.haste)) / 10;
        ctx.fillText(`Damage: ${dmg} every ${cooldown} seconds`, cursorX, cursorY);
        cursorY += 16;

        ctx.fillText(`Crit chance: ${this.character.crit}%`, cursorX, cursorY);
        cursorY += 16;

        let currentArmor = Math.max(0, this.character.armor - this.character.armorBroken);
        let armorReduc = 100 - Math.floor(100000 / (100 + currentArmor)) / 10;
        ctx.fillText(`Armor: ${currentArmor}. Reduce damage by ${armorReduc}%`, cursorX, cursorY);
        cursorY += 16;

        ctx.fillText(`Dodge chance: ${this.character.dodge}%`, cursorX, cursorY);
        cursorY += 16;
        if (this.character.buffs.length >= 1) {
            ctx.fillText(`Effects:`, tooltip.x + 8, this.buffY + 16);
        }
        for (let i = 0; i < this.character.buffs.length; i++) {
            const buffX = this.buffX + 24 * i;
            ctx.beginPath();
            ctx.lineWidth = "1";
            ctx.fillStyle = "white";
            ctx.rect(buffX, this.buffY, 22, 22);
            ctx.fill();
            this.character.buffs[i].paintScale(buffX + 1, this.buffY + 1, 20, 20)
        }

    }
    click(event) {
        for (let i = 0; i < this.character.buffs.length; i++) {
            const buffX = this.buffX + 24 * i;
            if (isInside({ x: buffX, y: this.buffY, width: 20, height: 20 }, event)) {
                tooltip.current = new BuffTooltip(this.character.buffs[i]);
                return true;
            }
        }     
        return false;
    }
}
class BuffTooltip {
    constructor(buff) {
        this.buff = buff;
    }
    paint() {
       
        let cursorY = tooltip.y + 22;
        let cursorX = tooltip.x + 8;

        ctx.fillStyle = "yellow";
        ctx.font = "bold 18px Verdana";
        ctx.fillText(this.buff.name, cursorX, cursorY);
        cursorY += 18;

        ctx.fillStyle = "white";
        ctx.font = "12px Verdana";
        ctx.fillText(`${this.buff.description}`, cursorX, cursorY);
        cursorY += 16;
    }    
}
class SpellTooltip {
    constructor(spell) {
        this.spell = spell;       
        this.spellStats = getPlayerSpellStats(spell);        
    }
    paint() {
        let cursorY = tooltip.y + 22;
        let cursorX = tooltip.x + 8;

        ctx.fillStyle = "green";
        ctx.font = "bold 18px Verdana";
        ctx.fillText(this.spell.fullName, cursorX, cursorY);
        cursorY += 18;

        ctx.fillStyle = "white";
        ctx.font = "12px Verdana";
        ctx.fillText(`${this.spell.description}`, cursorX, cursorY);
        cursorY += 16;
        ctx.fillText(`Heal: ${this.spellStats.minHeal} - ${this.spellStats.maxHeal} ${this.spellStats.suffix}`, cursorX, cursorY);
        cursorY += 16;
        ctx.fillText(`Mana: ${this.spellStats.mana}`, cursorX, cursorY);
        cursorY += 16;
        ctx.fillText(`Casting: ${this.spellStats.castingTimeSec} sec`, cursorX, cursorY);
        cursorY += 16;
        ctx.fillText(`Crit chance: ${this.spellStats.crit}%`, cursorX, cursorY);
    }    
}


let currentPage = new StartMenu();
// Debug mode:
if (window.location.search) {
    const params = new URLSearchParams(window.location.search);
    const lvl = params.get("lvl");
    if (lvl) {
        currentLevel = parseInt(lvl) - 1;
        teams = [heroesFactory.createPelin(), heroesFactory.createKnight(), heroesFactory.createWitch(), heroesFactory.createHunter()
            , heroesFactory.createHunter(), heroesFactory.createHunter(), heroesFactory.createHunter()
        ];
        spells = [aoeHeal, slowHeal2, fastHeal1, fastHeal2, hotHeal]
        currentPage = new SelectUpgradeScreen();
    }
}
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
function isInside(control, event) {
    if (!control) {
        return false;
    }
    return event.offsetX >= control.x && event.offsetX < control.x + control.width
        && event.offsetY >= control.y && event.offsetY < control.y + control.height
}
function onmousedown(event) {
    if (currentPage.click) {
        currentPage.click(event);
    }
    if (currentPage.buttons) {
        for (const c of currentPage.buttons) {
            if (isInside(c, event)) {
                c.click(event);
            }
        }
    }
}

let currentControl = null;
function onmousemove(event) {
    if (!currentPage.buttons)
        return;
    let newControl = null
    for (const c of currentPage.buttons) {
        if (isInside(c, event)) {
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