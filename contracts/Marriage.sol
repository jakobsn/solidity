pragma solidity ^0.5.12;
pragma experimental ABIEncoderV2;

contract Marriage {


    // Contract info
    string private _name;
    string private _symbol;

    constructor (string memory name, string  memory symbol) public {
        _name = name;
        _symbol = symbol;
    }

    /**
     * @dev Gets the token name
     * @return string representing the token name
     */
    function read_name() external view
    returns (string memory) {
        return _name;
    }

    /**
     * @dev Gets the token symbol
     * @return string representing the token symbol
     */
    function read_symbol() external view
    returns (string memory) {
        return _symbol;
    }

    // TASK 1 Arrange wedding

    // Store wedding as an object
    struct Wedding{
        address proposer;
        address accepter;
        uint64 date;
        address[] guest_list;
        string status;
    }

    // Mapping to represent a proposal
    mapping (address => address) private proposal;

    // Show all incoming proposals
    mapping (address => address[]) private proposals;

    // Record an accepted proposal
    mapping (address => address) private accepted_proposal;

    // weddingid to invited users
    //mapping (uint256 => address[]) private invitations;

    // Users to invitations
    mapping (address => uint256[]) private invitations;

    // List to store weddings
    Wedding[] weddings;

    // Link the addresses to be married to their wedding
    mapping (address => uint256) private address_to_wedding;

    // Propose to someone
    function propose (address to) public {
        proposal[msg.sender] = to;
        proposals[to].push(msg.sender);
    }

    function get_incoming_proposals () public view
    returns (address[] memory incoming_proposals) {
        incoming_proposals = proposals[msg.sender];
    }

    function get_pending_proposal () public view
    returns (address accepter) {
        accepter = proposal[msg.sender];
    }

    // Accept a proposal
    function accept (address from) public
    returns (uint256 weddingid) {
        require((proposal[from] == msg.sender), "Error, you have not been proposed to by this address");
        Wedding memory wedding;
        wedding.proposer = from;
        wedding.accepter = msg.sender;
        wedding.date = 0;
        address[] memory guest_list;
        wedding.guest_list = guest_list;
        wedding.status = "engaged";

        weddingid = weddings.push(wedding)-1;
        address_to_wedding[from] = weddingid;
        address_to_wedding[msg.sender] = weddingid;
    }

    // Arrange a wedding if the proposal has been accepted
    function arrange (uint256 weddingid, uint64 date, address[] memory guest_list) public {
        require((address_to_wedding[msg.sender] == weddingid), "Account is not engaged in any marriage");
        Wedding memory wedding = weddings[weddingid];
        wedding.date = date;
        wedding.guest_list = guest_list;
        wedding.status = "arranged";

        for (uint i = 0; i < guest_list.length; i++){
            invitations[guest_list[i]].push(weddingid);
        }

        weddings[weddingid] = wedding;
    }

    function get_wedding_id () public view
    returns (uint256 weddingid) {
        weddingid = address_to_wedding[msg.sender];
    }

    function get_wedding_by_id (uint256 weddingid) public view
    returns (Wedding memory wedding) {
        wedding = weddings[weddingid];
    }


    // TASK 2 Invitations


    // Record ticket creation to be able to retrieve it in the transaction
    event ObtainTicket(
        uint256 weddingid,
        bytes ticket,
        bytes32 weddingid_hash
    );

    // Record invitations by weddingid
    mapping (uint256 => bytes[]) private tickets;

    function accept_invitation (uint256 weddingid, bytes memory ticket) public {
        for (uint256 i = 0; i < invitations[msg.sender].length; i++) {
            if (weddingid == invitations[msg.sender][i]){
                bytes32 weddingid_hash = keccak256(abi.encodePacked(weddingid));
                tickets[weddingid].push(ticket);
                emit ObtainTicket(weddingid, ticket, weddingid_hash);
            }
        }
    }


    // TASK 3 Log in

    event AccessGranted(
        uint256 weddingid,
        address guest,
        bytes32 weddingid_hash
    );

    function show_ticket (uint8 v, bytes32 r, bytes32 s, uint256 weddingid) public
    returns (address guest) {
        bytes32 weddingid_hash = keccak256(abi.encodePacked(weddingid));
        guest = ecrecover(weddingid_hash, v, r, s);
        emit AccessGranted(weddingid, guest, weddingid_hash);
    }


    // TASK 4 wedding/Objection

    event CallForObjection(
        uint256 weddingid,
        string message,
        uint objection_time
    );

    mapping (uint256 => uint) objection_time;

    // Perform wedding and wait for objection
    function call_for_objection() public {
        uint256 weddingid = get_wedding_id();
        uint objection_time_now = (now + 3 seconds);
        string memory message = "if anyone has an objection to these twobeing married, speak now or forever hold your peace";
        objection_time[weddingid] = objection_time_now;
        emit CallForObjection(weddingid, message, objection_time_now);
    }

    mapping (uint256 => address[]) objections;

    function object(uint256 weddingid) public {
        Wedding memory wedding = weddings[weddingid];
        for (uint i = 0; i < wedding.guest_list.length; i++){
            if(msg.sender == wedding.guest_list[i]){
                objections[weddingid].push(msg.sender);
            }
        }
    }

    event Married(
        address proposer,
        address accepter,
        uint256 weddingid,
        uint time,
        uint objection_time
    );

    function seal_the_deal() public {
        uint256 weddingid = get_wedding_id();
        uint time = now;
        require((objection_time[weddingid] > 0), "Objection time not set");
        require((objection_time[weddingid] < time), "Hold your horses");
        require((objections[weddingid].length == 0), "Someone has objected");
        Wedding memory wedding = get_wedding_by_id(weddingid);
        emit Married(wedding.proposer, wedding.accepter, weddingid, time, objection_time[weddingid]);
    }

    // TASK 5 Vote over objection


}
