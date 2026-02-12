import { jsx as _jsx } from "react/jsx-runtime";
import { createContext, useContext, useState, useEffect } from 'react';
const AuthContext = createContext(undefined);
// Usuários hardcoded (em produção, isso viria do banco de dados)
const USERS = [
    { username: 'admin', password: 'anhanguera202501', role: 'admin', fullName: 'Administrador' },
    { username: 'carli.filho', password: 'batista123', role: 'professor', fullName: 'Carli Batista dos Santos Filho' },
    { username: 'carolina.vaz', password: 'fernandes123', role: 'professor', fullName: 'Carolina Fernandes Vaz' },
    { username: 'leticia.vilaca', password: 'cruvinel123', role: 'professor', fullName: 'Leticia Cruvinel Ramos Vilaca' },
    { username: 'laura.ricardo', password: 'borges123', role: 'professor', fullName: 'Laura Borges Ricardo' },
    { username: 'douglas.camilo', password: 'fabiano123', role: 'professor', fullName: 'Douglas Fabiano Senerrino Camilo' },
    { username: 'liliane.oliveira', password: 'torres123', role: 'professor', fullName: 'Liliane Torres de Oliveira' },
    { username: 'felipe.mesquita', password: 'dias123', role: 'professor', fullName: 'Felipe Dias Mesquita' },
    { username: 'luciano.santos', password: 'alex123', role: 'professor', fullName: 'Luciano Alex dos Santos' },
    { username: 'maximiano.pereira', password: 'eduardo123', role: 'admin', fullName: 'Maximiano Eduardo Pereira' },
    { username: 'cleidson.pereira', password: 'daniel123', role: 'professor', fullName: 'Cleidson Daniel Pereira' },
    { username: 'joao.martins', password: 'fernando123', role: 'professor', fullName: 'Joao Fernando Neves Martins' },
    { username: 'vanbasten.silva', password: 'fernandes123', role: 'professor', fullName: 'Vanbasten Fernandes Silva' },
    { username: 'alessandra.oliveira', password: 'cristina123', role: 'professor', fullName: 'Alessandra Cristina Oliveira' },
    { username: 'gisele.rosa', password: 'araujo123', role: 'professor', fullName: 'Gisele de Araujo Alvarenga Rosa' },
    { username: 'angela.sa', password: 'abreu123', role: 'professor', fullName: 'Angela Abreu Rosa de Sa' },
    { username: 'beatriz.silva', password: 'regina123', role: 'professor', fullName: 'Beatriz Regina da Silva' },
    { username: 'cristina.peres', password: 'ila123', role: 'professor', fullName: 'Cristina Ila de Oliveira Peres' },
    { username: 'isadora.cecilio', password: 'goncalves123', role: 'professor', fullName: 'Isadora Goncalves Severino Cecilio' },
    { username: 'vilma.moura', password: 'lucia123', role: 'professor', fullName: 'Vilma Lucia Moura' },
    { username: 'luiza.luiz', password: 'maire123', role: 'professor', fullName: 'Luiza Maire David Luiz' },
    { username: 'lais.rezende', password: 'miguel123', role: 'professor', fullName: 'Lais Miguel Rezende' },
    { username: 'roberto.junior', password: 'furlanetto123', role: 'professor', fullName: 'Roberto Furlanetto Junior' },
    { username: 'anahi.melo', password: 'paula123', role: 'professor', fullName: 'Anahi de Paula Melo' },
    { username: 'luciane.machado', password: 'medeiros123', role: 'professor', fullName: 'Luciane Medeiros Machado' },
    { username: 'adalmir.vieira', password: 'palacio123', role: 'professor', fullName: 'Adalmir Palacio Vieira' },
    { username: 'juliana.paiva', password: 'vieira123', role: 'professor', fullName: 'Juliana Vieira de Paiva' },
    { username: 'thais.degani', password: 'novais123', role: 'professor', fullName: 'Thais de Novais Degani' },
    { username: 'lilian.cantarelli', password: 'resende123', role: 'professor', fullName: 'Lilian Resende Naves Cantarelli' },
    { username: 'marilia.dutra', password: 'cherulli123', role: 'professor', fullName: 'Marilia Cherulli Dutra' },
    { username: 'francielle.mendes', password: 'alves123', role: 'professor', fullName: 'Francielle Alves Mendes' },
    { username: 'juliana.machado', password: 'rodrigues123', role: 'professor', fullName: 'Juliana Rodrigues Machado' },
    { username: 'fernanda.bettero', password: 'castelo123', role: 'professor', fullName: 'Fernanda Castelo Branco Santos Bettero' },
    { username: 'arnaldo.mundim', password: 'reis123', role: 'professor', fullName: 'Arnaldo Reis Mundim' },
    { username: 'laura.quagliatto', password: 'machado123', role: 'professor', fullName: 'Laura Machado Martins Quagliatto' },
    { username: 'ana.vilela', password: 'laura123', role: 'professor', fullName: 'Ana Laura Rezende Vilela' },
    { username: 'juliana.marinho', password: 'castro123', role: 'professor', fullName: 'Juliana de Castro Tourinho Marinho' },
    { username: 'witter.guerra', password: 'duarte123', role: 'professor', fullName: 'Witter Duarte Guerra' },
    { username: 'anisio.junior', password: 'domingos123', role: 'professor', fullName: 'Anisio Domingos de Oliveira Junior' },
    { username: 'juliana.queiroz', password: 'rodrigues123', role: 'professor', fullName: 'Juliana Rodrigues de Queiroz' },
    { username: 'ana.silverio', password: 'carolina123', role: 'professor', fullName: 'Ana Carolina Lino Silverio' },
    { username: 'silas.rezende', password: 'pereira123', role: 'professor', fullName: 'Silas Pereira de Rezende' },
    { username: 'kelly.alves', password: 'carvalho123', role: 'professor', fullName: 'Kelly Carvalho Alves' },
    { username: 'priscila.gobbato', password: 'guimaraes123', role: 'professor', fullName: 'Priscila Guimaraes Franke Gobbato' },
    { username: 'rafhaella.cardoso', password: 'cardoso123', role: 'professor', fullName: 'Rafhaella Cardoso' }, // 2 nomes
    { username: 'paulo.rezende', password: 'antonio123', role: 'professor', fullName: 'Paulo Antonio Moreira dos Santos Lemos Rezende' },
    { username: 'daniel.pinheiro', password: 'reis123', role: 'professor', fullName: 'Daniel dos Reis Pinheiro' },
    { username: 'flavio.moraes', password: 'machado123', role: 'professor', fullName: 'Flavio Machado de Moraes' },
    { username: 'cinthia.barbosa', password: 'domingos123', role: 'professor', fullName: 'Cinthia Domingos Barbosa' },
    { username: 'viviane.melo', password: 'luiz123', role: 'professor', fullName: 'Viviane Luiz de Melo' },
    { username: 'julio.almeida', password: 'cesar123', role: 'professor', fullName: 'Julio Cesar Neves de Almeida' },
    { username: 'kamila.paim', password: 'pinheiro123', role: 'professor', fullName: 'Kamila Pinheiro Paim' },
    { username: 'klenya.duarte', password: 'tavares123', role: 'professor', fullName: 'Klenya Tavares Duarte' },
    { username: 'ana.alves', password: 'paula123', role: 'professor', fullName: 'Ana Paula Prueza de Almeida Luna Alves' },
    { username: 'fulvio.souza', password: 'rafael123', role: 'professor', fullName: 'Fulvio Rafael Bento de Souza' },
    { username: 'marcia.avila', password: 'fernandes123', role: 'professor', fullName: 'Marcia Fernandes Pinheiro de Avila' },
    { username: 'marcia.godoi', password: 'ferreira123', role: 'professor', fullName: 'Marcia Ferreira de Godoi' },
    { username: 'andre.franca', password: 'madeira123', role: 'professor', fullName: 'Andre Madeira Silveira Franca' },
    { username: 'gustavo.fernandes', password: 'fernandes123', role: 'professor', fullName: 'Gustavo Fernandes' }, // 2 nomes
    { username: 'rogerio.goncalves', password: 'goncalves123', role: 'professor', fullName: 'Rogerio Goncalves' }, // 2 nomes
    { username: 'adelia.guimaraes', password: 'rodrigues123', role: 'professor', fullName: 'Adelia Rodrigues Guimaraes' },
    { username: 'nadia.fagundes', password: 'simarro123', role: 'professor', fullName: 'Nadia Simarro Fagundes' },
    { username: 'thiago.miranda', password: 'borges123', role: 'professor', fullName: 'Thiago Borges de Miranda' },
    { username: 'claudiney.nascimento', password: 'nascimento123', role: 'professor', fullName: 'Claudiney do Nascimento' }, // 2 nomes
    { username: 'erik.ferreira', password: 'chaves123', role: 'professor', fullName: 'Erik Chaves Ferreira' },
    { username: 'sibele.ribeiro', password: 'cristina123', role: 'professor', fullName: 'Sibele Cristina Ribeiro' },
    { username: 'marcus.alves', password: 'vinicius123', role: 'professor', fullName: 'Marcus Vinicius Patente Alves' },
    { username: 'natanna.gomes', password: 'kessia123', role: 'professor', fullName: 'Natanna Kessia Nunes Gomes' },
    { username: 'rogerio.borges', password: 'jose123', role: 'professor', fullName: 'Rogerio Jose Maria Borges' },
    { username: 'marcio.moreira', password: 'aurelio123', role: 'professor', fullName: 'Marcio Aurelio Ribeiro Moreira' },
    { username: 'junio.costa', password: 'cesar123', role: 'professor', fullName: 'Junio Cesar Costa' },
    { username: 'thaise.alonso', password: 'alonso123', role: 'professor', fullName: 'Thaise Alonso' }, // 2 nomes
    { username: 'maxwel.carmo', password: 'nunes123', role: 'professor', fullName: 'Maxwel Nunes do Carmo' },
    { username: 'claudio.damasceno', password: 'damasceno123', role: 'professor', fullName: 'Claudio Damasceno' }, // 2 nomes
    { username: 'gabriela.santos', password: 'correia123', role: 'professor', fullName: 'Gabriela Correia Santos' },
    { username: 'vilma.bartasson', password: 'aparecida123', role: 'professor', fullName: 'Vilma Aparecida Moreira Bartasson' },
    { username: 'juliana.rocha', password: 'mendonca123', role: 'professor', fullName: 'Juliana Mendonca de Melo Franco Rocha' },
    { username: 'michel.luz', password: 'evangelista123', role: 'professor', fullName: 'Michel Evangelista Oliveira Luz' },
    { username: 'fabiana.lima', password: 'augusta123', role: 'professor', fullName: 'Fabiana Augusta Ferreira Lima' },
    { username: 'marcio.lopes', password: 'marcal123', role: 'professor', fullName: 'Marcio Marcal Lopes' },
    { username: 'joao.barbosa', password: 'paulo123', role: 'professor', fullName: 'Joao Paulo Gomes Barbosa' },
    { username: 'mayara.lima', password: 'magalhaes123', role: 'professor', fullName: 'Mayara Magalhaes Lima' },
    { username: 'daniel.souza', password: 'alberto123', role: 'professor', fullName: 'Daniel Alberto Assis Souza' },
    { username: 'savia.rodrigues', password: 'sousa123', role: 'professor', fullName: 'Savia Sousa Rodrigues' },
    { username: 'mauro.suarez', password: 'paipa123', role: 'admin', fullName: 'Mauro Paipa Suarez' },
    { username: 'wendel.freitas', password: 'lima123', role: 'professor', fullName: 'Wendel Lima de Freitas' },
    { username: 'juliana.macedo', password: 'flavia123', role: 'professor', fullName: 'Juliana Flavia Palazzo da Costa Macedo' }
];
export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    useEffect(() => {
        // Carregar usuário do localStorage
        const savedUser = localStorage.getItem('agendamento_user');
        if (savedUser) {
            setUser(JSON.parse(savedUser));
        }
    }, []);
    const login = (username, password) => {
        const foundUser = USERS.find(u => u.username === username && u.password === password);
        if (foundUser) {
            const userData = {
                username: foundUser.username,
                role: foundUser.role,
                fullName: foundUser.fullName
            };
            setUser(userData);
            localStorage.setItem('agendamento_user', JSON.stringify(userData));
            return true;
        }
        return false;
    };
    const logout = () => {
        setUser(null);
        localStorage.removeItem('agendamento_user');
    };
    return (_jsx(AuthContext.Provider, { value: { user, login, logout, isAdmin: user?.role === 'admin' }, children: children }));
}
export function useAuth() {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}
