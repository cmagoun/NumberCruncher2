class ComponentManager {
    constructor() {
        this.emap = new Map();
        this.etoc = new Map();
        this.ctoe = new Map();

        this.indexesByComp = new Map();
        this.indexesByName = new Map();

        this.queuedAdds = [];
        this.queuedUpdates = [];
        this.queuedRemovals = [];
        this.queuedDestroys = [];
    }

    exists(id) {
       return this.etoc.get(id) !== undefined;
    }

    allEntities() {
        //returns array of entities asObject
        const result = [];
        this.emap.forEach((v,k) => result.push(v));
        return result;
    }

    clear() {
        this.etoc.clear();
        this.ctoe.clear();
        this.emap.clear();
    }

    createEntity(id) {
        const newId = id === undefined ? guid() : id;

        this.etoc.set(newId, new Map());
        this.emap.set(newId, {id:newId});

        return new Builder(newId, this);
    }

    destroyEntity(id) {
        this.queuedDestroys.push(id);
    }

    __destroyEntity(id) {
        if(!this.checkEntity(id)) return;

        const compList = Array.from(this.etoc.get(id).keys());

        let i = compList.length;
        while(i--) {
            this.ctoe.get(compList[i]).delete(id);
            this.__checkOnRemove(id, compList[i]);
        }

        this.etoc.delete(id);
        this.emap.delete(id);
    }

    __addComponentTo(eid, cname, data) {
        //does entity exist
        if(!this.checkEntity(eid)) return;

        //does component table exist
        if(this.ctoe.get(cname) === undefined) {
            this.createComponent(cname);
        }

        this.ctoe.get(cname).set(eid, 1);
        this.etoc.get(eid).set(cname, 1);
        this.emap.get(eid)[cname] = data;

        const index = this.indexesByComp.get(cname);
        if(index !== undefined) {
            if(eid === null) {
                let x = 100;
            }

             index.set(data, eid);
        }
    }

    addComponent(eid, data) {
        let {cname, ...obj} = data;
        this.queuedAdds.push({eid, cname, data:obj});
    }

    __addComponent(eid, data) {
        let {cname, ...obj} = data;
        this.__addComponentTo(eid, cname, obj);
    }

    removeComponentFrom(eid, cname) {
        this.queuedRemovals.push({eid, cname});
    }

    __removeComponentFrom(eid, cname) {
        if(!this.checkEntity(eid)) return;

        this.ctoe.get(cname).delete(eid);
        this.etoc.get(eid).delete(cname);

        this.__checkOnRemove(eid, cname);
     
        const index = this.indexesByComp.get(cname);
        if(index !== undefined) {
            index.remove(this.emap.get(eid)[cname], eid);
        }

        this.emap.get(eid)[cname] = undefined;
    }

    __checkOnRemove(eid, cname) {
        const comp = this.emap.get(eid)[cname];
        if(comp.onRemove) {
            comp.onRemove(eid, this);
        }
    }

    editComponentOf(eid, cname, data) {
        this.queuedUpdates.push({eid, cname, data});
    }

    __editComponentOf(eid, cname, data) {
        if(!this.checkEntity(eid)) return;

        const eobj = this.emap.get(eid);
        const existing = eobj[cname];

        const index = this.indexesByComp.get(cname);
        if(index !== undefined) {
            index.remove(eobj[cname], eid);
        }

        eobj[cname] = existing === undefined
            ? Object.assign({}, data)
            : Object.assign({}, existing, data);

        this.__checkOnEdit(eid, cname, data);

        if(index !== undefined) {
            index.set(eobj[cname], eid);
        }
    }

    __checkOnEdit(eid, cname, data) {
        const comp = this.emap.get(eid)[cname];
        if(comp.onEdit) {
            comp.onEdit(eid, data, this);
        }
    }

    createComponent(name) {
        const map = new Map();
        this.ctoe.set(name, map);
    }

    //probably don't need this anymore?
    component(entity, cname) {
        return this.emap.get(entity)[cname] || {};  
    }

    entitiesWith(cnames) {
        const names = Array.isArray(cnames) ? cnames : [cnames];

        const maps = names.map(n => this.ctoe.get(n));
        if(maps.includes(undefined)) return []; //one of the components does not exist

        const ids = this.intersectKeys(maps);
        return ids.map(id => this.entity(id));
    }

    entitiesIn(indexName, key, cnames) {
        const index = this.indexesByName.get(indexName);
        const keys = index.getByKey(key);

        if(cnames === undefined) return keys.map(id => this.entity(id));
        return this.with(keys, cnames);
    }

    with(list, cnames) {
        const names = Array.isArray(cnames) ? cnames : [cnames];
        const maps = names.map(n => this.ctoe.get(n));
        if(maps.includes(undefined)) return []; //one of the components does not exist

        maps.unshift(list);
        const ids = this.intersectKeys(maps);
        return ids.map(id => this.entity(id));
    }

    entitiesSimilar(indexName, entity) {
        const index = this.indexesByName.get(indexName);
        return index
            .get(entity[index.cname])
            .filter(e => e !== entity.id)
            .map(id => this.entity(id));
    }

    entity(id) {
        const result = this.emap.get(id);
       
        //TODO: Is this behavior desirable or should I return undefined?? or null??
        if(result === undefined) return {id};

        //helpers
        result.add = (component) => this.addComponent(result.id, component);
        result.edit = (cname, data) => this.editComponentOf(result.id, cname, data);
        result.remove = (cname) => this.removeComponentFrom(result.id, cname);
        result.destroy = () => this.destroyEntity(id);
        return result;
    }

    checkEntity(entity) {
        if(this.etoc.get(entity) === undefined) {
            console.log(`entity with id ${entity} does not exist!`);
            return false;
        }

        return true;
    }

    //works best if first map is smallest
    intersectKeys(maps) {
        const result = [];

        //maps.sort((a, b) => a.size - b.size);
        const first = maps[0];


        first.forEach((v,k) => {
            if(this.isInAll(k, maps)) result.push(k);
        });

        return result;
    }

    //start with index 1 since maps[0] is the one
    //providing the keys in the first place
    isInAll(key, maps) {
        for(let i = 1; i < maps.length; i++) {
            if(maps[i].get(key) === undefined) return false;
        }

        return true;
    }

    createIndex(name, cname, keygen) {
        const ci = new ComponentIndex(name, cname, keygen);
        this.indexesByComp.set(cname, ci);
        this.indexesByName.set(name, ci);

        const existing = this.entitiesWith(cname);
        existing.forEach(e => ci.set(e[cname], e.id));
    }

    performQueuedChanges() {
        //returns boolean that represents if any updates were performed
        if(this.queuedAdds.length === 0 &&
           this.queuedDestroys.length === 0 &&
           this.queuedRemovals.length === 0 &&
           this.queuedUpdates.length === 0) return false;

        this.queuedAdds.forEach(add => this.__addComponentTo(add.eid, add.cname, add.data));
        this.queuedUpdates.forEach(update => this.__editComponentOf(update.eid, update.cname, update.data));
        this.queuedRemovals.forEach(rem => this.__removeComponentFrom(rem.eid, rem.cname));
        this.queuedDestroys.forEach(des => this.__destroyEntity(des));

        //this.queuedUpdates.forEach(upd => console.log(`Update: {eid: ${upd.eid}, cname:${upd.cname}, data:${JSON.stringify(upd.data)}}`));

        this.queuedAdds = [];
        this.queuedUpdates = [];
        this.queuedRemovals = [];
        this.queuedDestroys = [];

        return true;
    }
}

//just a wrapper for the entity id and the cm functions
//goal is to produce a nice api around the cm functions
class Builder {
    constructor(id, cm) {
        this.id = id;
        this.cm = cm;
    }

    add(component) {
        this.cm.addComponent(this.id, component);
        return this;
    }

    remove(cname) {
        this.cm.removeComponentFrom(this.id, cname);
        return this;
    }

    read() {
        return this.cm.entity(this.id);
    }
}

class ComponentIndex {
    constructor(name, cname, keygen) {
        this.name = name;
        this.cname = cname;
        this.keyGenerator = keygen; //func
        this.index = new Map(); //{key, entities}
    }

    set(comp, id) {
        const key = this.keyGenerator(comp);
        const existing = this.index.get(key);
        if(existing === undefined) {
            this.index.set(key, new Map());
        }

        this.index.get(key).set(id, 1);
    }

    remove(comp, id) {
        const key = this.keyGenerator(comp);
        this.index.get(key).delete(id);
    }

    get(comp) {       
        const key = this.keyGenerator(comp);
        return this.getByKey(key);
    }

    getByKey(key) {
        const result = [];
        const index = this.index.get(key);
        if(index === undefined) return [];
        
        index.forEach((v, k) => result.push(k));
        return result;
    }
}


function guid() {
    return s4() + s4() + '-' + s4() + '-' + s4() + '-' +
      s4() + '-' + s4() + s4() + s4();
  }
  
function s4() {
    return Math.floor((1 + Math.random()) * 0x10000)
      .toString(16)
      .substring(1);
}

export {ComponentManager,  ComponentIndex, Builder};