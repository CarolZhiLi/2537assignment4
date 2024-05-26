//easy--easy button
//medium--medium button
//hard--hard button
//reset--reset button
//start--start button
//info--total, matches, left, clicks, timer, time, s
//total--total paris
//matches--pairs found
//left--pairs remaining
//clicks--number of clicks
//timer--total time
//time--time left
//s--there is s or not
//game--game cards
//themes
//dark--dark button
//lignt--light button

$(document).ready(function () {
    const baseURL = "https://pokeapi.co/api/v2/pokemon/";
    let cardsData = [];
    let totalPairs = 0;
    let pairsFound = 0;
    let remainPairs = totalPairs - pairsFound;
    let clicks = 0;
    let totalTime;
    let gameTimer;

    let firstCard = null;
    let secondCard = null;
    let lockBoard = false;

    let selectedDifficulty = null;
                
    $("#info").hide();
    $("#game").hide();
    $("#themes").hide();
    


    function setupGame(pairsCount, timeLimit) {        
        fetchPokemon(pairsCount).then(() =>{
            totalPairs = pairsCount;
            remainPairs = totalPairs - pairsFound;
            totalTime = timeLimit;
            console.log(totalPairs);
            console.log(pairsFound);
            console.log(remainPairs);

            $("#matches").text(pairsFound);
            $("#total").text(totalPairs);
            $("#clicks").text(clicks);
            $("#left").text(remainPairs);
            $("#timer").text(totalTime);

            startTimer();
        });
        
    }

    async function fetchPokemon(pairsCount) {
        let pokemonPromises = [];
        for (let i = 0; i < pairsCount; i++) {
            let randomId = Math.floor(Math.random() * 810) + 1; 
            pokemonPromises.push(fetch(baseURL + randomId).then(response => response.json()));
            console.log(baseURL + randomId);
            console.log(pokemonPromises);
        }
        
        try {
            let pokemons = await Promise.all(pokemonPromises);
            cardsData = [];
            pokemons.forEach(pokemon => {
                let card = {
                    id: pokemon.id,
                    name: pokemon.name,
                    image: pokemon.sprites.front_default
                };
                console.log(card);
                cardsData.push(card, {...card});
            });
            console.log("card data:" + cardsData);
            shuffleArray(cardsData);
            console.log("shuffled:" + cardsData);
            displayCards(cardsData);
            console.log("displayed:" + cardsData);
        } catch (error) {
            console.error("Failed to fetch Pokémon data: ", error);
        }
    }

    function shuffleArray(array) {
        for (let i = array.length - 1; i > 0; i--) {
            let j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
    }

    function displayCards(array) {
        console.log("cards displayed");
        console.log("cards data" + cardsData);
        let gameArea = $("#game");
        gameArea.empty();
        for (let i = 0; i < array.length; i++) {
            console.log(array[i].id);
            console.log(array[i].image);
            let cardElement = $(`
                <div class="card">
                    <img id="img${i}" src="${array[i].image}" alt="${array[i].name}" class="front_face">
                    <img class="back_face" src="back.webp" alt="default">
                </div>
            `);
            gameArea.append(cardElement);
        }
        console.log("gameArea updated with cards");  



    $(".card").click(function () {
        if (lockBoard || $(this).hasClass("flip") || $(this).hasClass("matched")) {
            return;
        }    
        $(this).addClass("flip");
        clicks++;
        $("#clicks").text(clicks); 
        //power up per 10 clicks for medium and hard levels
        console.log("click"+ clicks);
        if (clicks % 10 === 0 && (selectedDifficulty === "medium" ||selectedDifficulty === "hard")){
            alert("Power up!");
            powerUp();
        }

        if (!firstCard) {
            firstCard = this;
        } else {
            secondCard = this;
            checkForMatch();
        }
    });
    
    function checkForMatch() {
        lockBoard = true;
    
        let isFirstCardMatch = $(firstCard).find(".front_face").attr("src");
        let isSecondCardMatch = $(secondCard).find(".front_face").attr("src");
    
        if (isFirstCardMatch === isSecondCardMatch) {
            // It's a match
            setTimeout(() => {
                $(firstCard).addClass("matched");
                $(secondCard).addClass("matched");
                pairsFound++;
                $("#matches").text(pairsFound);
                remainPairs = totalPairs - pairsFound;
                $("#left").text(remainPairs);
                
                if (pairsFound === totalPairs) {
                    win();
                // //     $("#game").addClass("win");
                // //     setTimeout(() => {
                // //         alert("Congratulations! You've found all matches!");
                // //     }, 1000); 

                //     setTimeout(() => {
                //         $("#winModal").css('display', 'block');
                //     }, 1000); // Display win modal after a short delay
            
                }
                resetBoard(true); 
            }, 1000);
            
        } else {
            // Not a match
            setTimeout(() => {
                $(firstCard).removeClass("flip");
                $(secondCard).removeClass("flip");
                resetBoard(false); 
            }, 1000); 
        }
    }

    function win() {
        console.log("Checking for win - Pairs found: " + pairsFound + ", Total pairs: " + totalPairs);
        $("#winModal").css('display', 'block');
        stopTimer();

        $('.close').click(function() {
            $('#winModal').css('display', 'none');
        });
    }

   
    function resetBoard(matchFound) {
        if (matchFound) {
            $(firstCard).off("click");
            $(secondCard).off("click");
        }
        firstCard = null;
        secondCard = null;
        lockBoard = false;
    }

    
    function powerUp() {
        $(".card.flip:not(.matched)").addClass("in-play");
        $(".card:not(.matched)").addClass("flip");
    
        setTimeout(() => {
            $(".card:not(.matched):not(.in-play)").removeClass("flip");
            $(".card.in-play").removeClass("in-play");
        }, 1000); 
    }

}
    

    $("#start").click(function () {
        selectedDifficulty = $('input[name="btnradio"]:checked').attr("id");
        console.log(selectedDifficulty);
        switch (selectedDifficulty) {
            case "easy":
                $("#game").addClass("level1");
                setupGame(3, 20); 
                break;
            case "medium":
                $("#game").addClass("level2");
                setupGame(5, 50); 
                break;
            case "hard":
                $("#game").addClass("level3");
                setupGame(10, 100); 
                break;
            }
        console.log(selectedDifficulty);
        //alert("test");
        $("#start").hide();
        $("#info").show();
        $("#game").show();
        $("#themes").show();
        $("#s").show();
        console.log("rp" + remainPairs);
        console.log("pf" + pairsFound);
        console.log("tp" + totalPairs);
        $("#left").text(remainPairs);  
        $("#time").text(totalTime);     
    });


    $("#reset").click(function () {
        //resetGame();
        $("#start").show();
    });


    //timer works
    function startTimer() {
        gameTimer = setInterval(function () {
        if (totalTime > 0) {
            totalTime--;
            $("#time").text(totalTime);
            
            if(totalTime==1){
                $("#s").hide();
            }
        } else {
            alert("Time's up! Try again.");
            clearInterval(gameTimer);
            resetGame();
            $("#start").show();
        }
        }, 1000);
    }

    function stopTimer() {
        clearInterval(gameTimer);
    }

    function resetGame() {
        pairsFound = 0;
        clicks = 0;
        cardsData = [];
        $("#info").hide();
        $("#game").hide();
        $("#themes").hide();
        resetGameStats();
    }

    function resetGameStats() {
        $("#clicks").text("0");
        $("#matches").text("0");
        $("#left").text("0");
        $("#total").text("0");
        $("#time").text("0");
        $("#game").removeClass("win");
    }


    $("#light").click(function () {
        $("#game").removeClass("dark").addClass("light");
    });

    $("#dark").click(function () {
        $("#game").removeClass("light").addClass("dark");
    });

})

    
