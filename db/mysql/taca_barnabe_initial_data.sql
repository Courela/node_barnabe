INSERT INTO `user` (`Username`, `Password`, `TeamId`) VALUES ('Admin', '$2b$10$q/h.cC/Ct3XC14Zm6BAXDOjzaAwyTf5kogrlJMT9MJvznGXd8FTYu', NULL);
INSERT INTO `season` (`Year`, `IsActive`, `SignUpDueDate`, `StartDate`) VALUES (2019, b'0', '2019-09-15 00:00:00', '2019-09-20 00:00:00');
INSERT INTO `season` (`Year`, `IsActive`, `SignUpDueDate`, `StartDate`) VALUES (2022, b'1', '2022-09-03 00:00:00', '2019-09-23 00:00:00');
INSERT INTO `step` (`Id`, `Description`, `Gender`, `IsCaretakerRequired`) VALUES (1, 'Escalão I', 'X', b'1');
INSERT INTO `step` (`Id`, `Description`, `Gender`, `IsCaretakerRequired`) VALUES (2, 'Escalão II', 'M', b'1');
INSERT INTO `step` (`Id`, `Description`, `Gender`, `IsCaretakerRequired`) VALUES (3, 'Escalão III', 'M', b'0');
INSERT INTO `step` (`Id`, `Description`, `Gender`, `IsCaretakerRequired`) VALUES (4, 'Escolinhas', 'X', b'1');
INSERT INTO `step` (`Id`, `Description`, `Gender`, `IsCaretakerRequired`) VALUES (5, 'Feminino', 'F', b'0');
INSERT INTO `role` (`Id`,`Description`) VALUES (1, 'Jogador');
INSERT INTO `role` (`Id`,`Description`) VALUES (2, 'Treinador');
INSERT INTO `role` (`Id`,`Description`) VALUES (3, 'Treinador Adjunto');
INSERT INTO `role` (`Id`,`Description`) VALUES (4, 'Delegado');
INSERT INTO `role` (`Id`,`Description`) VALUES (5, 'Massagista');
INSERT INTO `role` (`Id`,`Description`) VALUES (6, 'Médico');
INSERT INTO `phase` (`Id`, `Name`) VALUES (1, 'Grupo');
INSERT INTO `phase` (`Id`, `Name`) VALUES (2, 'Campeonato');
INSERT INTO `phase` (`Id`, `Name`) VALUES (3, 'Playoff');
INSERT INTO `phase` (`Id`, `Name`) VALUES (4, 'Quartos de Final');
INSERT INTO `phase` (`Id`, `Name`) VALUES (5, 'Meias Finais');
INSERT INTO `phase` (`Id`, `Name`) VALUES (6, 'Final');
INSERT INTO `phase` (`Id`, `Name`) VALUES (7, '3º/4º Lugar');
