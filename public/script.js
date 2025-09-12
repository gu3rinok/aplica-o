document.addEventListener('DOMContentLoaded', () => {
    const stars = document.querySelectorAll('.star');
    const submitBtn = document.getElementById('submit-btn');
    const reviewInput = document.getElementById('review-input');
    const message = document.getElementById('message');
    const reviewContainer = document.getElementById('reviewContainer');
    let rating = 0;

    stars.forEach(star => {
        star.addEventListener('click', () => {
            rating = parseInt(star.dataset.value);
            updateStars(rating);
            submitBtn.disabled = false;
        });
    });

    function updateStars(rate) {
        stars.forEach(star => {
            if (parseInt(star.dataset.value) <= rate) {
                star.classList.add('active');
            } else {
                star.classList.remove('active');
            }
        });
    }

    // Função para renderizar a avaliação
    function renderReview(reviewData) {
        // Remover estado vazio se existir
        const emptyState = reviewContainer.querySelector('.empty-state');
        if (emptyState) {
            reviewContainer.removeChild(emptyState);
        }
        
        // Criar elemento de card
        const reviewCard = document.createElement('div');
        reviewCard.className = 'review-card';
        
        // Formatar a data
        const reviewDate = new Date().toLocaleDateString('pt-BR', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
        
        // Gerar estrelas baseadas na avaliação
        let starsHtml = '';
        for (let i = 1; i <= 5; i++) {
            starsHtml += i <= reviewData.rating ? '&#9733;' : '&#9734;';
        }
        
        // Preencher o card com os dados
        reviewCard.innerHTML = `
            <div class="card-header">
                <div class="card-stars">${starsHtml}</div>
                <div class="card-date">${reviewDate}</div>
            </div>
            <div class="card-comment">${reviewData.review || 'Sem comentário'}</div>
        `;
        
        // Adicionar o card como primeiro elemento do container
        if (reviewContainer.firstChild) {
            reviewContainer.insertBefore(reviewCard, reviewContainer.firstChild);
        } else {
            reviewContainer.appendChild(reviewCard);
        }
    }

    submitBtn.addEventListener('click', async () => {
        const review = reviewInput.value;
        submitBtn.disabled = true;
        message.textContent = 'Enviando...';

        try {
            // Tenta chamar a API real primeiro
            const response = await fetch('/api/rate', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ rating, review })
            });

            // Verifica se a resposta é JSON
            const contentType = response.headers.get('content-type');
            if (contentType && contentType.includes('application/json')) {
                const result = await response.json();
                if (response.ok) {
                    message.textContent = 'Obrigado por sua avaliação!';
                    reviewInput.value = '';
                    rating = 0;
                    updateStars(0);
                    
                    // Exibir o último comentário
                    renderReview(result.data);
                    
                    setTimeout(() => {
                        message.textContent = '';
                    }, 3000);
                } else {
                    throw new Error(result.error || 'Erro ao enviar avaliação.');
                }
            } else {
                // Se não for JSON, usa simulação
                const textResponse = await response.text();
                console.warn('A API retornou HTML em vez de JSON. Usando modo simulado.', textResponse.substring(0, 100));
                
                // Modo simulado para desenvolvimento
                simulateApiResponse(rating, review);
            }
        } catch (error) {
            console.error('Erro na requisição:', error);
            // Modo simulado para desenvolvimento em caso de erro
            simulateApiResponse(rating, review);
        }
    });

    // Função para simular resposta da API em desenvolvimento
    function simulateApiResponse(rating, review) {
        // Simula um delay de rede
        setTimeout(() => {
            const mockData = {
                id: Math.floor(Math.random() * 1000),
                rating: rating,
                review: review || null,
                created_at: new Date().toISOString()
            };
            
            message.textContent = 'Avaliação enviada com sucesso! (modo simulado)';
            reviewInput.value = '';
            updateStars(0);
            
            // Exibir o último comentário
            renderReview(mockData);
            
            setTimeout(() => {
                message.textContent = '';
                submitBtn.disabled = false;
            }, 3000);
        }, 800);
    }
});