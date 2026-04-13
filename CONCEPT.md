we want to build a simple event management for service industry like yoga class, etc like that, basically
it should be this simple : 

- it is simply create an event
    -> inside of that event we will had a catalog (generic term like for class, or session, whatever it name)
        -> and it will have an add-ons on top of that
    -> relation will be, 1 event, many catalog, 1 catalog many addons
    -> we will have dedicated crud for addons, then for crud catalog, on create it will map / include which addons we will use
    -> also apply the same for event, will map / include which catalog it will have
- catalog and addons will have strike_price, and price


any idea, regarding this concept? think dont code

---

feedback : 


- app-layout naming
- 