1. Project Name

- Yugioh Deck Builder

2. Teck Stack

- Front End: React JS
- Back End: Python
- Database:

  - Card Information: db/all_cards.csv file
    - id
    - name
    - type
    - frameType
    - description
    - level
    - atk
    - def
    - race
    - attribute
    - archetype
- Card Images: a folder in local "C:\Users\Legion\Documents\MEGA\EN Series 9 Card Library"

3, UI

- Left Panel: Card Information View
- Middle Panel: List of Decks View, Deck Builder View
- Right Panel: Search Card View

3. Functions

- Card Information View

  - Image of card from local folder
  - Information of that card
  - When a card is hover from Deck Builder View or Search Card Result Zone, it will get the id, then from that id get name, and from name search exact image in local folder
- Search card View

  - Search Bar (search by card's description, card's name)
  - Search Card Result Zone
  - Add from Search Card Result Zone to Deck Builder View by
    - Left Mouse: Hold Drag
    - Right Mouse: Click
  - Hover to card in Search Card Result Zone
    - Show all information of that card from file csv and image from local folder in Card Information View
- List of Decks View

  - Search Bar (search by deck name)
  - Button Create New Deck
  - Show all decks in db/decks.json with
    - Deck Name:
    - Deck Cover Image:
    - Quantity:
      - Main Deck
      - Extra Deck
      - Side Deck
    - Button Edit
    - Button Delete
- Deck Builder View

  - Deck will have
    - Name
    - Cover Image
    - Deck List

      - Main Deck: 0 - 60
      - Extra Deck: 0 - 15
      - Side Deck: 0 - 15
    - Decklist Zone

      - Main Deck Zone: A Rectangle Zone with 6 row, each row contains 10 slots (total 60)
      - Extra Deck Zone: A Rectangle Zone with 2 row, row 1 contains 10 slots, row 2 contains 5 slots (total 15)
      - Side Deck Zone: A Rectangle Zone with 2 row, row 1 contains 10 slots, row 2 contains 5 slots (total 15)
      - If hover, in a slot, Card Information Zone will show informaion and card image
      - Can drag and insert card slot at any slot (then other slots from that position will auto increment and rearrage position)
      - Click right mouse to remove a card from zone, (then other slots from that position will auto decreent and rearrange posision)
    - Button Import/Export file txt

      - Content:
        #main
        `<id card here>`
        `<id card here>`
        #extra
        `<id card here>`
        `<id card here>`
        !side
        `<id card here>`
        `<id card here>`
        #extra
    - Button to Save

      - Save to a db/decks.json file with id card (below is example)
        [
        {
        "id": `<UUID>`
        "name":
        "deck-list": {
        "main-deck": [
        390850,
        390850,
        ......
        ],
        "extra-deck": [
        390850,
        390850,
        ......
        ],
        "side-deck": [
        390850,
        390850,
        ......
        ]
        }
        },

        ]
    - Button to Delete
    - Button to Clear Content in deck
    - Button to Sort in this order/priority

      - Monster
        - frameType
          - frameType contains "normal"
          - frameType contains "effect"
          - frameType contains "ritual"
          - frameType contains "fusion"
          - frameType contains "synchro"
          - frameType contains "xyz"
          - frameType contains "link"
        - if same frameType, then level
        - if same level, then atk
        - if same atk, then def
        - if same def, then name
      - Spell
        - frameType = "spell"
          - if same frameType, then race in alphabet
            - if same race, then name in alphabet
      - Trap
        - frameType = "trap"
          - if same frameType, then race in alphabet
            - if same race, then name in alphabet
      - other frameType
