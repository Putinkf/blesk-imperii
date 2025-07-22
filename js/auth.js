/* Стили для страниц аутентификации */
.auth-page {
    background: var(--bg-primary);
    min-height: 100vh;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 20px;
    position: relative;
    overflow: hidden;
}

.auth-page::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: radial-gradient(circle at 30% 40%, rgba(139, 115, 85, 0.1) 0%, transparent 50%),
                radial-gradient(circle at 80% 20%, rgba(197, 179, 147, 0.1) 0%, transparent 50%),
                radial-gradient(circle at 40% 80%, rgba(139, 115, 85, 0.05) 0%, transparent 50%);
    z-index: -1;
}

.auth-container {
    position: relative;
    z-index: 1;
}

.auth-card {
    background: var(--bg-secondary);
    backdrop-filter: blur(20px);
    border: 2px solid var(--border-color);
    border-radius: 25px;
    padding: 40px;
    width: 100%;
    max-width: 450px;
    box-shadow: 0 20px 60px var(--shadow-heavy);
    position: relative;
    overflow: hidden;
    animation: authCardAppear 0.6s cubic-bezier(0.4, 0, 0.2, 1);
}

@keyframes authCardAppear {
    from {
        opacity: 0;
        transform: translateY(30px) scale(0.95);
    }
    to {
        opacity: 1;
        transform: translateY(0) scale(1);
    }
}

.auth-card::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 4px;
    background: linear-gradient(90deg, var(--accent-color), #a0916d, var(--accent-secondary), #c5b393, var(--accent-color));
    border-radius: 25px 25px 0 0;
}

.auth-header {
    text-align: center;
    margin-bottom: 30px;
}

.auth-crown {
    font-size: 3rem;
    margin-bottom: 15px;
    animation: crownFloat 3s ease-in-out infinite;
}

@keyframes crownFloat {
    0%, 100% { transform: translateY(0px); }
    50% { transform: translateY(-5px); }
}

.auth-card h1 {
    font-family: 'Playfair Display', serif;
    font-size: 1.8rem;
    font-weight: 900;
    color: var(--text-accent);
    text-shadow: 2px 2px 4px var(--shadow-light);
    margin-bottom: 10px;
    letter-spacing: 1px;
}

.auth-subtitle {
    color: var(--accent-color);
    font-style: italic;
    font-weight: 600;
    font-size: 1rem;
}

.auth-form {
    display: flex;
    flex-direction: column;
    gap: 20px;
}

.form-group {
    display: flex;
    flex-direction: column;
    gap: 8px;
}

.form-group label {
    font-weight: 700;
    color: var(--text-accent);
    font-size: 0.9rem;
    display: flex;
    align-items: center;
    gap: 8px;
}

.form-group input {
    padding: 15px 20px;
    border: 2px solid var(--border-color);
    border-radius: 15px;
    background: var(--bg-card);
    color: var(--text-primary);
    font-family: 'Crimson Text', serif;
    font-size: 1rem;
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    backdrop-filter: blur(10px);
}

.form-group input:focus {
    border-color: var(--accent-color);
    outline: none;
    box-shadow: 0 0 0 4px rgba(139, 115, 85, 0.1);
    transform: translateY(-1px);
}

.form-group input::placeholder {
    color: rgba(var(--text-secondary), 0.6);
    font-style: italic;
}

.auth-submit {
    background: linear-gradient(135deg, var(--accent-color) 0%, var(--accent-secondary) 50%, #a0916d 100%);
    color: white;
    border: none;
    padding: 16px 30px;
    border-radius: 25px;
    font-family: 'Playfair Display', serif;
    font-size: 1.1rem;
    font-weight: 700;
    cursor: pointer;
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    text-transform: uppercase;
    letter-spacing: 1px;
    box-shadow: 0 8px 25px rgba(139, 115, 85, 0.4);
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 10px;
    position: relative;
    overflow: hidden;
}

.auth-submit::before {
    content: '';
    position: absolute;
    top: 0;
    left: -100%;
    width: 100%;
    height: 100%;
    background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
    transition: left 0.5s ease;
}

.auth-submit:hover::before {
    left: 100%;
}

.auth-submit:hover {
    background: linear-gradient(135deg, var(--accent-secondary) 0%, #a0916d 50%, var(--accent-color) 100%);
    transform: translateY(-2px);
    box-shadow: 0 12px 35px rgba(139, 115, 85, 0.5);
}

.auth-submit:active {
    transform: translateY(0);
    box-shadow: 0 6px 20px rgba(139, 115, 85, 0.4);
}

.btn-icon {
    font-size: 1.2rem;
    animation: iconSpin 2s ease-in-out infinite;
}

@keyframes iconSpin {
    0%, 90%, 100% { transform: rotate(0deg); }
    45% { transform: rotate(5deg); }
    55% { transform: rotate(-5deg); }
}

.auth-links {
    display: flex;
    flex-direction: column;
    gap: 12px;
    text-align: center;
    margin-top: 20px;
    padding-top: 20px;
    border-top: 1px solid var(--border-color);
}

.auth-links a {
    color: var(--accent-color);
    text-decoration: none;
    font-weight: 600;
    font-size: 0.95rem;
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    padding: 8px 16px;
    border-radius: 10px;
}

.auth-links a:hover {
    color: var(--text-accent);
    background: rgba(139, 115, 85, 0.1);
    transform: translateY(-1px);
}

/* Адаптивность */
@media (max-width: 500px) {
    .auth-card {
        padding: 30px 25px;
        margin: 10px;
    }
    
    .auth-card h1 {
        font-size: 1.5rem;
    }
    
    .auth-crown {
        font-size: 2.5rem;
    }
    
    .form-group input {
        padding: 12px 16px;
    }
    
    .auth-submit {
        padding: 14px 25px;
        font-size: 1rem;
    }
}
