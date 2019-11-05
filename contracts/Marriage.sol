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

    // TASK 1 Arrange marriage

    // Store marriage as an object
    struct Marriage{}

    // Mapping to represent a proposal
    mapping (address => address) private proposal;
    
    // Show all incoming proposals
    mapping (address => address[]) private proposals
    
    // Record an accepted proposal
    mapping (address => address) private accepted_proposal;

    // Marriageid to invited users
    mapping (uint256 => address[]) private invitations;

    // Users to invitations
    mapping (address => uint256[]) private invitations

    // Propose to someone
    function propose (address to) public {}

    // Accept a proposal
    function accept (address from) public {}

    // Arrange a marriage if the proposal has been accepted
    function arrange (string memory date, string[] memory guest_list) public {}


    // TASK 2 Invitations

    mapping (address => uint256[]) private tickets

    function accept invitation (uint256 marriageid) public {}


    // TASK 3 Log in

    function show_ticket (uint256 ticked) public {}


    // TASK 4 Marriage/Objection

    // Perform marriage and wait for objection
    function perform_marriage () public {}


    // TASK 5 Vote over objection
}
