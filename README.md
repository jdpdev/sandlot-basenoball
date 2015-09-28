# sandlot-basenoball
Entry to the SA GameDev Challege X game jam. Placed in the final-round top 12, won side-prize for "Best Use of Cats".

Major versions of the game are pushed to play at http://dupersaurus.github.io/sandlot-basenoball/. Repo can be download to play locally.

####Immediate Tasks
Game was submitted with code in "just make it work" quality. I am beginning a refactoring to improve the codebase, to be followed by changes to the game.

Rough roadmap for the refactoring is as follows:

__[Encounters](https://github.com/dupersaurus/sandlot-basenoball/issues/9)__ 
Each type of encounter between a fielder and a batter/runner (batter vs pitcher, catching fielder vs batter, etc) is run by an Encounter object that: 

* Contains the logic for the type of encounter
* Manages the UI for the counter

__[AI State Machine](https://github.com/dupersaurus/sandlot-basenoball/issues/14)__
The different behaviors of characters in the field of play bundled up into a state machine, rather than hardcoded into Player class. See issue for break down of AI behaviors.

####Game Improvements
Once the refactoring is complete, work will begin on iterating over the game design, with a mind to releasing it. 

* Revamp the way calculations are performed
* Improve the way calculations are presented to the player
* Add opponent AI
* Decide to continue development for the web, or port for a mobile release
