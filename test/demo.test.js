const Marriage = artifacts.require("./Marriage.sol");


contract("Marriage", accounts => {

    name = "Marriage";
    symbol = "M";
    proposer = accounts[0]
    accepter = accounts[1]
    guest_list = accounts.slice(2)
    date_time = "11/09/2020 14:00";
    unix_date_time = Date.parse(date_time);

    it("Access the marriage contract", async () => {
        contract = await Marriage.deployed()
        expect(await contract.read_symbol()).to.equal(symbol);
        expect(await contract.read_name()).to.equal(name);
    })

    it("Make a proposal", async () => {
        propose = await contract.propose(accepter, {from: proposer});
        expect(await contract.get_pending_proposal({from: proposer})).to.equal(accepter);
        expect(await contract.get_incoming_proposals({from: accepter})).to.include(proposer)
    })
    
    it("Accept proposal", async () => {
        wedding = await contract.accept(proposer, {from: accepter});
        weddingid = await contract.get_wedding_id()
        wedding_object = await contract.get_wedding_by_id(weddingid)
        console.log(wedding_object)
        expect(wedding_object.proposer).to.equal(proposer);
        expect(wedding_object.accepter).to.equal(accepter);
        expect(wedding_object.status).to.equal("engaged");
    })

    it("Arrange wedding", async () => {
        wedding = await contract.arrange(weddingid, unix_date_time, guest_list, {from: proposer})
        weddingid = await contract.get_wedding_id()
        wedding_object = await contract.get_wedding_by_id(weddingid)
        console.log(wedding_object)
        expect(wedding_object.proposer).to.equal(proposer);
        expect(wedding_object.accepter).to.equal(accepter);
        expect(wedding_object.date).to.equal(String(unix_date_time));
        for (let i = 0; i < guest_list.length; i++){
            expect(wedding_object.guest_list[i]).to.equal(guest_list[i]);
        }
        expect(wedding_object.status).to.equal("arranged");
    })

})