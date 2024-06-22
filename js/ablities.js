ability = {
    name: "Ability",
    cd: 10
}

ability.forget = Object.create(ability);
ability.forget.name = "Forget spells";
ability.forget.cd = 100;
ability.forget.use = function(usr, target) {
    usr.spells = [];
}